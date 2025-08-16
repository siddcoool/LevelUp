import { Types } from 'mongoose';
import { 
  TestSession, 
  StudentProgress, 
  Question, 
  User 
} from '../models';
import { QuestionSelectionService } from './QuestionSelectionService';
import { 
  CreateSessionRequest, 
  SubmitSessionRequest, 
  TestSession as TestSessionInterface,
  StudentProgress as StudentProgressInterface,
  Mode,
  ScopeType
} from '../types';

export class SessionService {
  private static readonly QUESTIONS_PER_LEVEL = 30;
  private static readonly LEVEL_UP_THRESHOLD = 0.6; // 60% correct to level up
  private static readonly SKILL_LEARNING_RATE = 0.1; // How quickly skill adjusts
  private static readonly RECENT_QUESTIONS_CAP = 300;

  /**
   * Create a new test session with 30 questions
   */
  static async createSession(
    clerkUserId: string,
    request: CreateSessionRequest
  ): Promise<TestSessionInterface> {
    // Get or create user
    const user = await this.getOrCreateUser(clerkUserId);
    
    // Get or create student progress for the scope
    const progress = await this.getOrCreateProgress(
      user._id,
      request.mode,
      request.branchId,
      request.subjectId,
      request.topicId
    );

    // Calculate target difficulty based on current skill
    const difficultyRange = QuestionSelectionService.getDifficultyRange(progress.skill);
    const targetDifficulty = difficultyRange.target;

    // Select questions
    const questions = await QuestionSelectionService.selectQuestions({
      branchId: new Types.ObjectId(request.branchId),
      subjectId: request.subjectId ? new Types.ObjectId(request.subjectId) : undefined,
      topicId: request.topicId ? new Types.ObjectId(request.topicId) : undefined,
      targetDifficulty,
      difficultyRange: 0.15,
      excludeQuestionIds: progress.recentQuestionIds,
      count: this.QUESTIONS_PER_LEVEL
    });

    // Create question items snapshot (without correct answers for security)
    const questionItems = questions.map(q => ({
      questionId: q._id,
      stem: q.stem,
      options: q.options,
      difficulty: q.difficulty,
      // Don't include correctIndex in the snapshot sent to client
    }));

    // Create the test session
    const session = await TestSession.create({
      userId: user._id,
      mode: request.mode,
      branchId: new Types.ObjectId(request.branchId),
      subjectId: request.subjectId ? new Types.ObjectId(request.subjectId) : undefined,
      topicId: request.topicId ? new Types.ObjectId(request.topicId) : undefined,
      levelNumber: progress.currentLevel,
      targetDifficulty,
      questionItems,
      responses: [],
      completed: false,
      startedAt: new Date()
    });

    // Update progress last session time
    await StudentProgress.findByIdAndUpdate(progress._id, {
      lastSessionAt: new Date()
    });

    return session;
  }

  /**
   * Submit a completed test session and update progress
   */
  static async submitSession(
    sessionId: string,
    request: SubmitSessionRequest
  ): Promise<TestSessionInterface> {
    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.completed) {
      throw new Error('Session already completed');
    }

    // Process responses and calculate score
    const responses = request.responses.map(r => {
      const questionItem = session.questionItems.find(q => 
        q.questionId.toString() === r.questionId
      );
      
      if (!questionItem) {
        throw new Error(`Question ${r.questionId} not found in session`);
      }

      // Get the correct answer from the original question
      return {
        questionId: new Types.ObjectId(r.questionId),
        selectedIndex: r.selectedIndex,
        correct: r.selectedIndex === questionItem.correctIndex,
        timeSec: r.timeSec
      };
    });

    const correctCount = responses.filter(r => r.correct).length;
    const score = correctCount / this.QUESTIONS_PER_LEVEL;

    // Update session
    const updatedSession = await TestSession.findByIdAndUpdate(
      sessionId,
      {
        responses,
        score,
        completed: true,
        completedAt: new Date()
      },
      { new: true }
    );

    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    // Update question statistics
    await this.updateQuestionStats(responses);

    // Update student progress
    await this.updateStudentProgress(session, score, responses);

    return updatedSession;
  }

  /**
   * Get a test session (with correct answers hidden until completion)
   */
  static async getSession(sessionId: string, includeAnswers: boolean = false): Promise<TestSessionInterface> {
    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // If not completed or answers not requested, hide correct answers
    if (!session.completed || !includeAnswers) {
      const sanitizedSession = {
        ...session.toObject(),
        questionItems: session.questionItems.map(q => ({
          ...q,
          correctIndex: undefined // Hide correct answer
        }))
      };
      return sanitizedSession as TestSessionInterface;
    }

    return session;
  }

  /**
   * Get or create a user record
   */
  private static async getOrCreateUser(clerkUserId: string) {
    let user = await User.findOne({ clerkUserId });
    
    if (!user) {
      // In a real app, you'd get user details from Clerk
      user = await User.create({
        clerkUserId,
        role: 'student',
        name: 'Student', // Placeholder
        email: 'student@example.com' // Placeholder
      });
    }

    return user;
  }

  /**
   * Get or create student progress for a scope
   */
  private static async getOrCreateProgress(
    userId: Types.ObjectId,
    mode: Mode,
    branchId: string,
    subjectId?: string,
    topicId?: string
  ): Promise<StudentProgressInterface> {
    let scopeType: ScopeType;
    let scopeId: Types.ObjectId | undefined;

    if (mode === 'topic' && topicId) {
      scopeType = 'topic';
      scopeId = new Types.ObjectId(topicId);
    } else if (mode === 'subject' && subjectId) {
      scopeType = 'subject';
      scopeId = new Types.ObjectId(subjectId);
    } else {
      scopeType = 'branch';
      scopeId = undefined;
    }

    let progress = await StudentProgress.findOne({
      userId,
      scopeType,
      scopeId,
      branchId: new Types.ObjectId(branchId)
    });

    if (!progress) {
      progress = await StudentProgress.create({
        userId,
        scopeType,
        scopeId,
        branchId: new Types.ObjectId(branchId),
        currentLevel: 1,
        skill: 0.5,
        totalAnswered: 0,
        totalCorrect: 0,
        streak: 0,
        recentQuestionIds: []
      });
    }

    return progress;
  }

  /**
   * Update question statistics after session completion
   */
  private static async updateQuestionStats(responses: any[]): Promise<void> {
    const updatePromises = responses.map(response =>
      QuestionSelectionService.updateQuestionStats(
        response.questionId,
        response.correct,
        response.timeSec
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Update student progress after session completion
   */
  private static async updateStudentProgress(
    session: TestSessionInterface,
    score: number,
    responses: any[]
  ): Promise<void> {
    const progress = await StudentProgress.findOne({
      userId: session.userId,
      scopeType: session.mode === 'topic' ? 'topic' : session.mode === 'subject' ? 'subject' : 'branch',
      scopeId: session.mode === 'topic' ? session.topicId : session.mode === 'subject' ? session.subjectId : undefined,
      branchId: session.branchId
    });

    if (!progress) {
      throw new Error('Student progress not found');
    }

    // Update basic stats
    const newTotalAnswered = progress.totalAnswered + this.QUESTIONS_PER_LEVEL;
    const newTotalCorrect = progress.totalCorrect + responses.filter(r => r.correct).length;

    // Update skill using simple learning rate adjustment
    const accuracy = score;
    const skillAdjustment = this.SKILL_LEARNING_RATE * (accuracy - this.LEVEL_UP_THRESHOLD);
    const newSkill = Math.max(0, Math.min(1, progress.skill + skillAdjustment));

    // Update streak
    let newStreak = progress.streak;
    if (accuracy >= this.LEVEL_UP_THRESHOLD) {
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    // Determine if level should increase
    let newLevel = progress.currentLevel;
    if (accuracy >= this.LEVEL_UP_THRESHOLD) {
      newLevel += 1;
    }

    // Update recent question IDs (rolling window)
    const questionIds = session.questionItems.map(q => q.questionId);
    const newRecentQuestionIds = [
      ...questionIds,
      ...progress.recentQuestionIds
    ].slice(0, this.RECENT_QUESTIONS_CAP);

    // Update progress
    await StudentProgress.findByIdAndUpdate(progress._id, {
      currentLevel: newLevel,
      skill: newSkill,
      totalAnswered: newTotalAnswered,
      totalCorrect: newTotalCorrect,
      streak: newStreak,
      lastSessionAt: new Date(),
      recentQuestionIds: newRecentQuestionIds
    });
  }

  /**
   * Get student's current progress for all scopes
   */
  static async getStudentProgress(userId: Types.ObjectId, branchId: Types.ObjectId) {
    return await StudentProgress.find({ userId, branchId }).sort({ scopeType: 1, createdAt: 1 });
  }
}
