import { Types } from 'mongoose';
import { Question } from '../models/index';
import { 
  QuestionSelectionParams, 
  CoverageBalanceParams, 
  Mode, 
  Question as QuestionInterface 
} from '../types/index';

export class QuestionSelectionService {
  private static readonly QUESTIONS_PER_LEVEL = 30;
  private static readonly DIFFICULTY_RANGE = 0.15;
  private static readonly RECENT_QUESTIONS_CAP = 300;

  /**
   * Select questions for a test session based on student progress and difficulty targets
   */
  static async selectQuestions(params: QuestionSelectionParams): Promise<QuestionInterface[]> {
    const { branchId, subjectId, topicId, targetDifficulty, difficultyRange, excludeQuestionIds, count } = params;
    
    // Build the base filter
    const filter: any = {
      status: 'approved',
      branchId,
      _id: { $nin: excludeQuestionIds },
      difficulty: {
        $gte: Math.max(0, targetDifficulty - difficultyRange),
        $lte: Math.min(1, targetDifficulty + difficultyRange)
      }
    };

    // Add subject/topic filters
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (topicId) {
      filter.topicIds = topicId;
    }

    // Get question pool with smart sorting
    const pool = await Question.find(filter)
      .sort({
        // Primary: closest to target difficulty
        $expr: {
          $abs: { $subtract: ['$difficulty', targetDifficulty] }
        },
        // Secondary: fewer attempts (surface fresh questions)
        'stats.attemptCount': 1,
        // Tertiary: newer questions
        createdAt: -1
      })
      .limit(200); // Get more than needed for coverage balancing

    if (pool.length === 0) {
      throw new Error('No questions available for the specified criteria');
    }

    // Apply coverage balancing
    const balancedQuestions = this.balanceCoverage({
      mode: topicId ? 'topic' : subjectId ? 'subject' : 'all',
      subjectId,
      topicId,
      questions: pool,
      needed: count
    });

    // If we don't have enough questions, try to backfill
    if (balancedQuestions.length < count) {
      const backfillQuestions = await this.getBackfillQuestions(
        filter,
        excludeQuestionIds,
        count - balancedQuestions.length,
        targetDifficulty
      );
      balancedQuestions.push(...backfillQuestions);
    }

    return balancedQuestions.slice(0, count);
  }

  /**
   * Balance question coverage across subjects/topics based on mode
   */
  private static balanceCoverage(params: CoverageBalanceParams): QuestionInterface[] {
    const { mode, subjectId, topicId, questions, needed } = params;
    
    if (mode === 'topic' || questions.length <= needed) {
      return questions.slice(0, needed);
    }

    if (mode === 'subject') {
      return this.balanceTopicCoverage(questions, needed);
    }

    // Mode: 'all' - balance across subjects
    return this.balanceSubjectCoverage(questions, needed);
  }

  /**
   * Balance questions across topics within a subject
   */
  private static balanceTopicCoverage(questions: QuestionInterface[], needed: number): QuestionInterface[] {
    // Group questions by topic
    const topicGroups = new Map<string, QuestionInterface[]>();
    
    questions.forEach(q => {
      q.topicIds.forEach(topicId => {
        const topicKey = topicId.toString();
        if (!topicGroups.has(topicKey)) {
          topicGroups.set(topicKey, []);
        }
        topicGroups.get(topicKey)!.push(q);
      });
    });

    // Calculate minimum questions per topic
    const minPerTopic = Math.max(1, Math.floor(needed / topicGroups.size));
    const balanced: QuestionInterface[] = [];
    const usedQuestions = new Set<string>();

    // First pass: add minimum questions from each topic
    topicGroups.forEach((topicQuestions, topicKey) => {
      const selected = topicQuestions
        .filter(q => !usedQuestions.has(q._id.toString()))
        .slice(0, minPerTopic);
      
      selected.forEach(q => {
        balanced.push(q);
        usedQuestions.add(q._id.toString());
      });
    });

    // Second pass: fill remaining slots
    const remaining = needed - balanced.length;
    if (remaining > 0) {
      const remainingQuestions = questions.filter(q => !usedQuestions.has(q._id.toString()));
      balanced.push(...remainingQuestions.slice(0, remaining));
    }

    return balanced;
  }

  /**
   * Balance questions across subjects for branch-wide tests
   */
  private static balanceSubjectCoverage(questions: QuestionInterface[], needed: number): QuestionInterface[] {
    // Group questions by subject
    const subjectGroups = new Map<string, QuestionInterface[]>();
    
    questions.forEach(q => {
      const subjectKey = q.subjectId.toString();
      if (!subjectGroups.has(subjectKey)) {
        subjectGroups.set(subjectKey, []);
      }
      subjectGroups.get(subjectKey)!.push(q);
    });

    // Calculate minimum questions per subject
    const minPerSubject = Math.max(1, Math.floor(needed / subjectGroups.size));
    const balanced: QuestionInterface[] = [];
    const usedQuestions = new Set<string>();

    // First pass: add minimum questions from each subject
    subjectGroups.forEach((subjectQuestions, subjectKey) => {
      const selected = subjectQuestions
        .filter(q => !usedQuestions.has(q._id.toString()))
        .slice(0, minPerSubject);
      
      selected.forEach(q => {
        balanced.push(q);
        usedQuestions.add(q._id.toString());
      });
    });

    // Second pass: fill remaining slots
    const remaining = needed - balanced.length;
    if (remaining > 0) {
      const remainingQuestions = questions.filter(q => !usedQuestions.has(q._id.toString()));
      balanced.push(...remainingQuestions.slice(0, remaining));
    }

    return balanced;
  }

  /**
   * Get backfill questions when primary selection doesn't yield enough
   */
  private static async getBackfillQuestions(
    baseFilter: any,
    excludeQuestionIds: Types.ObjectId[],
    count: number,
    targetDifficulty: number
  ): Promise<QuestionInterface[]> {
    // Try slightly easier questions
    const easierFilter = {
      ...baseFilter,
      _id: { $nin: excludeQuestionIds },
      difficulty: {
        $gte: Math.max(0, targetDifficulty - this.DIFFICULTY_RANGE * 2),
        $lt: baseFilter.difficulty.$gte
      }
    };

    let backfill = await Question.find(easierFilter)
      .sort({ 'stats.attemptCount': 1, createdAt: -1 })
      .limit(count);

    // If still not enough, try harder questions
    if (backfill.length < count) {
      const harderFilter = {
        ...baseFilter,
        _id: { $nin: excludeQuestionIds },
        difficulty: {
          $gt: baseFilter.difficulty.$lte,
          $lte: Math.min(1, targetDifficulty + this.DIFFICULTY_RANGE * 2)
        }
      };

      const harderQuestions = await Question.find(harderFilter)
        .sort({ 'stats.attemptCount': 1, createdAt: -1 })
        .limit(count - backfill.length);

      backfill.push(...harderQuestions);
    }

    // Last resort: previously seen questions older than N days
    if (backfill.length < count) {
      const oldQuestionsFilter = {
        ...baseFilter,
        _id: { $nin: excludeQuestionIds },
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
      };

      const oldQuestions = await Question.find(oldQuestionsFilter)
        .sort({ createdAt: -1 })
        .limit(count - backfill.length);

      backfill.push(...oldQuestions);
    }

    return backfill;
  }

  /**
   * Update question statistics after a session
   */
  static async updateQuestionStats(
    questionId: Types.ObjectId,
    correct: boolean,
    timeSec: number
  ): Promise<void> {
    const question = await Question.findById(questionId);
    if (!question) return;

    const stats = question.stats;
    const newAttemptCount = stats.attemptCount + 1;
    const newCorrectCount = stats.correctCount + (correct ? 1 : 0);
    
    // Rolling average for time
    const newAvgTime = (stats.avgTimeSec * stats.attemptCount + timeSec) / newAttemptCount;

    await Question.findByIdAndUpdate(questionId, {
      'stats.attemptCount': newAttemptCount,
      'stats.correctCount': newCorrectCount,
      'stats.avgTimeSec': newAvgTime
    });
  }

  /**
   * Get difficulty range for a given skill level
   */
  static getDifficultyRange(skill: number): { min: number; max: number; target: number } {
    const jitter = 0.1; // ±10% variation
    const target = Math.max(0.2, Math.min(0.9, skill));
    const min = Math.max(0, target - jitter);
    const max = Math.min(1, target + jitter);
    
    return { min, max, target };
  }
}
