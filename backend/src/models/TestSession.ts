import mongoose, { Schema } from 'mongoose';
import { TestSession as TestSessionInterface, TestQuestionItem, TestResponse } from '../types/index.js';

const TestQuestionItemSchema = new Schema<TestQuestionItem>({
  questionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Question',
    required: true 
  },
  stem: { 
    type: String, 
    required: true 
  },
  options: [{ 
    type: String, 
    required: true 
  }],
  correctIndex: { 
    type: Number 
  },
  difficulty: { 
    type: Number, 
    required: true 
  },
}, { _id: false });

const TestResponseSchema = new Schema<TestResponse>({
  questionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Question',
    required: true 
  },
  selectedIndex: { 
    type: Number, 
    required: true 
  },
  correct: { 
    type: Boolean, 
    required: true 
  },
  timeSec: { 
    type: Number, 
    required: true 
  },
}, { _id: false });

const TestSessionSchema = new Schema<TestSessionInterface>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    index: true,
    required: true 
  },
  mode: { 
    type: String, 
    enum: ['all', 'subject', 'topic'], 
    index: true,
    required: true 
  },
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch', 
    index: true,
    required: true 
  },
  subjectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subject' 
  },
  topicId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Topic' 
  },

  levelNumber: { 
    type: Number, 
    index: true,
    required: true 
  },
  targetDifficulty: { 
    type: Number,
    required: true 
  },

  questionItems: [TestQuestionItemSchema],
  responses: [TestResponseSchema],

  score: { 
    type: Number 
  },
  completed: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
}, { 
  timestamps: true 
});

// Performance indexes
TestSessionSchema.index({ userId: 1, completed: 1, createdAt: -1 });
TestSessionSchema.index({ branchId: 1, subjectId: 1, levelNumber: 1 });
TestSessionSchema.index({ userId: 1, createdAt: -1 });

export const TestSession = mongoose.model<TestSessionInterface>('TestSession', TestSessionSchema);
