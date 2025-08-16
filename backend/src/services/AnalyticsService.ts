import { Types } from 'mongoose';
import { 
  TestSession, 
  User, 
  DailyMetrics, 
  Question,
  Branch 
} from '../models';

export class AnalyticsService {
  /**
   * Get overview metrics for a date range
   */
  static async getOverviewMetrics(fromDate: Date, toDate: Date) {
    const fromDateStr = this.formatDate(fromDate);
    const toDateStr = this.formatDate(toDate);

    // Get or create daily metrics for the date range
    const metrics = await this.getOrCreateDailyMetrics(fromDateStr, toDateStr);

    // Calculate totals
    const totalNewUsers = metrics.reduce((sum, m) => sum + m.newUsers, 0);
    const totalActiveUsers = metrics.reduce((sum, m) => sum + m.activeUsers, 0);
    const totalSessionsStarted = metrics.reduce((sum, m) => sum + m.sessionsStarted, 0);
    const totalSessionsCompleted = metrics.reduce((sum, m) => sum + m.sessionsCompleted, 0);
    
    const avgScore = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.avgScore, 0) / metrics.length 
      : 0;

    // Branch breakdown
    const branchBreakdown = await this.getBranchBreakdown(fromDate, toDate);

    return {
      period: { from: fromDateStr, to: toDateStr },
      totals: {
        newUsers: totalNewUsers,
        activeUsers: totalActiveUsers,
        sessionsStarted: totalSessionsStarted,
        sessionsCompleted: totalSessionsCompleted,
        avgScore
      },
      branchBreakdown,
      dailyMetrics: metrics
    };
  }

  /**
   * Get topic accuracy heatmap for a branch
   */
  static async getTopicAccuracyHeatmap(branchId: string, fromDate: Date, toDate: Date) {
    const sessions = await TestSession.aggregate([
      {
        $match: {
          branchId: new Types.ObjectId(branchId),
          completed: true,
          createdAt: { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $unwind: '$responses'
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'responses.questionId',
          foreignField: '_id',
          as: 'question'
        }
      },
      {
        $unwind: '$question'
      },
      {
        $unwind: '$question.topicIds'
      },
      {
        $group: {
          _id: '$question.topicIds',
          attempts: { $sum: 1 },
          correct: { 
            $sum: { 
              $cond: ['$responses.correct', 1, 0] 
            } 
          }
        }
      },
      {
        $project: {
          topicId: '$_id',
          accuracy: { 
            $divide: ['$correct', '$attempts'] 
          },
          attempts: 1,
          correct: 1
        }
      },
      {
        $sort: { accuracy: 1 }
      }
    ]);

    return sessions;
  }

  /**
   * Get individual user response drilldown
   */
  static async getUserResponses(userId: string, fromDate: Date, toDate: Date) {
    const sessions = await TestSession.find({
      userId: new Types.ObjectId(userId),
      completed: true,
      createdAt: { $gte: fromDate, $lte: toDate }
    })
    .populate('branchId', 'name')
    .populate('subjectId', 'name')
    .populate('topicId', 'name')
    .sort({ createdAt: -1 });

    const userStats = await this.calculateUserStats(userId, fromDate, toDate);

    return {
      userStats,
      sessions: sessions.map(session => ({
        id: session._id,
        mode: session.mode,
        branch: session.branchId,
        subject: session.subjectId,
        topic: session.topicId,
        levelNumber: session.levelNumber,
        score: session.score,
        completedAt: session.completedAt,
        questionCount: session.questionItems.length
      }))
    };
  }

  /**
   * Get sessions with filters
   */
  static async getSessions(filters: {
    branchId?: string;
    subjectId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const { branchId, subjectId, fromDate, toDate, limit = 50, offset = 0 } = filters;

    const matchFilter: any = { completed: true };
    
    if (branchId) matchFilter.branchId = new Types.ObjectId(branchId);
    if (subjectId) matchFilter.subjectId = new Types.ObjectId(subjectId);
    if (fromDate || toDate) {
      matchFilter.createdAt = {};
      if (fromDate) matchFilter.createdAt.$gte = fromDate;
      if (toDate) matchFilter.createdAt.$lte = toDate;
    }

    const sessions = await TestSession.find(matchFilter)
      .populate('userId', 'name email')
      .populate('branchId', 'name')
      .populate('subjectId', 'name')
      .populate('topicId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await TestSession.countDocuments(matchFilter);

    return {
      sessions: sessions.map(session => ({
        id: session._id,
        user: session.userId,
        mode: session.mode,
        branch: session.branchId,
        subject: session.subjectId,
        topic: session.topicId,
        levelNumber: session.levelNumber,
        score: session.score,
        completedAt: session.completedAt,
        questionCount: session.questionItems.length
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Get or create daily metrics for a date range
   */
  private static async getOrCreateDailyMetrics(fromDateStr: string, toDateStr: string) {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    const metrics: any[] = [];

    // Generate date range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = this.formatDate(currentDate);
      
      let dailyMetric = await DailyMetrics.findOne({ date: dateStr });
      
      if (!dailyMetric) {
        // Calculate metrics for this date
        dailyMetric = await this.calculateDailyMetrics(currentDate);
      }
      
      metrics.push(dailyMetric);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }

  /**
   * Calculate daily metrics for a specific date
   */
  private static async calculateDailyMetrics(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // New users
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Active users (users who started or completed sessions)
    const activeUserIds = await TestSession.distinct('userId', {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const activeUsers = activeUserIds.length;

    // Sessions started
    const sessionsStarted = await TestSession.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Sessions completed
    const sessionsCompleted = await TestSession.countDocuments({
      completed: true,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Average score
    const completedSessions = await TestSession.find({
      completed: true,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    }).select('score');

    const avgScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
      : 0;

    // Branch breakdown
    const branchBreakdown = await this.calculateBranchBreakdown(startOfDay, endOfDay);

    const dailyMetric = await DailyMetrics.findOneAndUpdate(
      { date: this.formatDate(date) },
      {
        newUsers,
        activeUsers,
        sessionsStarted,
        sessionsCompleted,
        avgScore,
        branchBreakdown
      },
      { upsert: true, new: true }
    );

    return dailyMetric;
  }

  /**
   * Calculate branch breakdown for a date range
   */
  private static async calculateBranchBreakdown(startDate: Date, endDate: Date) {
    const breakdown = await TestSession.aggregate([
      {
        $match: {
          completed: true,
          completedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$branchId',
          sessions: { $sum: 1 },
          totalScore: { $sum: '$score' }
        }
      },
      {
        $project: {
          branchId: '$_id',
          sessions: 1,
          avgScore: { $divide: ['$totalScore', '$sessions'] }
        }
      },
      {
        $sort: { sessions: -1 }
      }
    ]);

    return breakdown;
  }

  /**
   * Get branch breakdown for a date range
   */
  private static async getBranchBreakdown(fromDate: Date, toDate: Date) {
    return await TestSession.aggregate([
      {
        $match: {
          completed: true,
          createdAt: { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $group: {
          _id: '$branchId',
          sessions: { $sum: 1 },
          totalScore: { $sum: '$score' }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $unwind: '$branch'
      },
      {
        $project: {
          branchId: '$_id',
          branchName: '$branch.name',
          sessions: 1,
          avgScore: { $divide: ['$totalScore', '$sessions'] }
        }
      },
      {
        $sort: { sessions: -1 }
      }
    ]);
  }

  /**
   * Calculate user statistics
   */
  private static async calculateUserStats(userId: string, fromDate: Date, toDate: Date) {
    const sessions = await TestSession.find({
      userId: new Types.ObjectId(userId),
      completed: true,
      createdAt: { $gte: fromDate, $lte: toDate }
    });

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionItems.length, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + (s.score || 0) * s.questionItems.length, 0);
    const avgScore = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

    // Level progression
    const levels = sessions.map(s => s.levelNumber);
    const maxLevel = Math.max(...levels, 0);
    const avgLevel = levels.length > 0 ? levels.reduce((sum, l) => sum + l, 0) / levels.length : 0;

    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      avgScore,
      maxLevel,
      avgLevel,
      period: { from: fromDate, to: toDate }
    };
  }

  /**
   * Format date to YYYY-MM-DD string
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
