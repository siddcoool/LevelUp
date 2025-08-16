import mongoose, { Schema } from 'mongoose';
import { Question as QuestionInterface } from '../types/index.js';

const QuestionStatsSchema = new Schema({
  attemptCount: { 
    type: Number, 
    default: 0 
  },
  correctCount: { 
    type: Number, 
    default: 0 
  },
  avgTimeSec: { 
    type: Number, 
    default: 0 
  },
}, { _id: false });

const QuestionSchema = new Schema<QuestionInterface>({
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch', 
    index: true,
    required: true 
  },
  subjectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subject', 
    index: true,
    required: true 
  },
  topicIds: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Topic', 
    index: true 
  }],

  source: { 
    type: String, 
    enum: ['db', 'ai'], 
    default: 'db', 
    index: true 
  },
  status: { 
    type: String, 
    enum: ['approved', 'pending', 'rejected'], 
    default: 'approved', 
    index: true 
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
    type: Number, 
    required: true 
  },
  solution: { 
    type: String 
  },

  difficulty: { 
    type: Number, 
    default: 0.5, 
    index: true 
  },
  tags: [{ 
    type: String, 
    index: true 
  }],

  stats: {
    type: QuestionStatsSchema,
    default: () => ({})
  },

  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, { 
  timestamps: true 
});

// Critical performance indexes
QuestionSchema.index({ branchId: 1, subjectId: 1, difficulty: 1, status: 1 });
QuestionSchema.index({ topicIds: 1, status: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ difficulty: 1, status: 1 });

export const Question = mongoose.model<QuestionInterface>('Question', QuestionSchema);
