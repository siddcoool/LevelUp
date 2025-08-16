import mongoose, { Schema } from 'mongoose';
import { Topic as TopicInterface } from '../types/index.js';

const TopicSchema = new Schema<TopicInterface>({
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
  key: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  syllabusPath: [{ 
    type: String 
  }],
  order: { 
    type: Number, 
    required: true 
  },
}, { 
  timestamps: true 
});

TopicSchema.index({ branchId: 1, subjectId: 1, key: 1 }, { unique: true });

export const Topic = mongoose.model<TopicInterface>('Topic', TopicSchema);
