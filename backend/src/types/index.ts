import { Types } from 'mongoose';

// Core types
export type ScopeType = 'branch' | 'subject' | 'topic';
export type Mode = 'all' | 'subject' | 'topic';
export type QuestionSource = 'db' | 'ai';
export type QuestionStatus = 'approved' | 'pending' | 'rejected';
export type AIGenStatus = 'queued' | 'generating' | 'human_review' | 'approved' | 'rejected' | 'error';
export type UserRole = 'student' | 'admin';

// Base document interface
export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User interfaces
export interface User extends BaseDocument {
  clerkUserId: string;
  role: UserRole;
  name: string;
  email: string;
}

// Taxonomy interfaces
export interface Branch extends BaseDocument {
  key: string;
  name: string;
  order: number;
}

export interface Subject extends BaseDocument {
  branchId: Types.ObjectId;
  key: string;
  name: string;
  order: number;
  topicCount: number;
}

export interface Topic extends BaseDocument {
  branchId: Types.ObjectId;
  subjectId: Types.ObjectId;
  key: string;
  name: string;
  syllabusPath: string[];
  order: number;
}

// Question interfaces
export interface QuestionStats {
  attemptCount: number;
  correctCount: number;
  avgTimeSec: number;
}

export interface Question extends BaseDocument {
  branchId: Types.ObjectId;
  subjectId: Types.ObjectId;
  topicIds: Types.ObjectId[];
  source: QuestionSource;
  status: QuestionStatus;
  stem: string;
  options: string[];
  correctIndex: number;
  solution?: string;
  difficulty: number;
  tags: string[];
  stats: QuestionStats;
  createdBy?: Types.ObjectId;
}

// Student progress interfaces
export interface StudentProgress extends BaseDocument {
  userId: Types.ObjectId;
  scopeType: ScopeType;
  scopeId?: Types.ObjectId;
  branchId: Types.ObjectId;
  currentLevel: number;
  skill: number;
  totalAnswered: number;
  totalCorrect: number;
  streak: number;
  lastSessionAt?: Date;
  recentQuestionIds: Types.ObjectId[];
}

// Test session interfaces
export interface TestQuestionItem {
  questionId: Types.ObjectId;
  stem: string;
  options: string[];
  correctIndex?: number;
  difficulty: number;
}

export interface TestResponse {
  questionId: Types.ObjectId;
  selectedIndex: number;
  correct: boolean;
  timeSec: number;
}

export interface TestSession extends BaseDocument {
  userId: Types.ObjectId;
  mode: Mode;
  branchId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  levelNumber: number;
  targetDifficulty: number;
  questionItems: TestQuestionItem[];
  responses: TestResponse[];
  score?: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// AI generation queue interfaces
export interface AIGenTask extends BaseDocument {
  branchId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  difficulty: number;
  count: number;
  status: AIGenStatus;
  error?: string;
  createdBy: Types.ObjectId;
}

// Analytics interfaces
export interface BranchBreakdown {
  branchId: Types.ObjectId;
  sessions: number;
  avgScore: number;
}

export interface DailyMetrics extends BaseDocument {
  date: string;
  newUsers: number;
  activeUsers: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  avgScore: number;
  branchBreakdown: BranchBreakdown[];
}

// API request/response interfaces
export interface CreateSessionRequest {
  mode: Mode;
  branchId: string;
  subjectId?: string;
  topicId?: string;
}

export interface SubmitSessionRequest {
  responses: Array<{
    questionId: string;
    selectedIndex: number;
    timeSec: number;
  }>;
}

export interface AuthRequest {
  clerkUserId: string;
  token: string;
}

// Service interfaces
export interface QuestionSelectionParams {
  branchId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  targetDifficulty: number;
  difficultyRange: number;
  excludeQuestionIds: Types.ObjectId[];
  count: number;
}

export interface CoverageBalanceParams {
  mode: Mode;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  questions: Question[];
  needed: number;
}
