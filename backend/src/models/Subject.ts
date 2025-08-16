import mongoose, { Schema } from 'mongoose';
import { Subject as SubjectInterface } from '../types/index.js';

const SubjectSchema = new Schema<SubjectInterface>({
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch', 
    index: true,
    required: true 
  },
  key: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  topicCount: { 
    type: Number, 
    default: 0 
  },
}, { 
  timestamps: true 
});

SubjectSchema.index({ branchId: 1, key: 1 }, { unique: true });

export const Subject = mongoose.model<SubjectInterface>('Subject', SubjectSchema);
