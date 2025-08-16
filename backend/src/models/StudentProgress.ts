import mongoose, { Schema } from 'mongoose';
import { StudentProgress as StudentProgressInterface } from '../types/index.js';

const StudentProgressSchema = new Schema<StudentProgressInterface>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    index: true,
    required: true 
  },
  scopeType: { 
    type: String, 
    enum: ['branch', 'subject', 'topic'], 
    index: true,
    required: true 
  },
  scopeId: { 
    type: Schema.Types.ObjectId, 
    index: true 
  },
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch', 
    index: true,
    required: true 
  },

  currentLevel: { 
    type: Number, 
    default: 1 
  },
  skill: { 
    type: Number, 
    default: 0.5 
  },
  totalAnswered: { 
    type: Number, 
    default: 0 
  },
  totalCorrect: { 
    type: Number, 
    default: 0 
  },
  streak: { 
    type: Number, 
    default: 0 
  },
  lastSessionAt: { 
    type: Date 
  },

  recentQuestionIds: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Question' 
  }],
}, { 
  timestamps: true 
});

// Unique index to prevent duplicate progress records for the same scope
StudentProgressSchema.index(
  { userId: 1, scopeType: 1, scopeId: 1 }, 
  { unique: true }
);

export const StudentProgress = mongoose.model<StudentProgressInterface>('StudentProgress', StudentProgressSchema);
