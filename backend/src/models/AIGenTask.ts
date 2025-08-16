import mongoose, { Schema } from 'mongoose';
import { AIGenTask as AIGenTaskInterface } from '../types/index.js';

const AIGenTaskSchema = new Schema<AIGenTaskInterface>({
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch',
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
  difficulty: { 
    type: Number, 
    required: true 
  },
  count: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['queued', 'generating', 'human_review', 'approved', 'rejected', 'error'], 
    index: true,
    default: 'queued' 
  },
  error: { 
    type: String 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { 
  timestamps: true 
});

AIGenTaskSchema.index({ status: 1, createdAt: 1 });
AIGenTaskSchema.index({ branchId: 1, subjectId: 1, topicId: 1 });

export const AIGenTask = mongoose.model<AIGenTaskInterface>('AIGenTask', AIGenTaskSchema);
