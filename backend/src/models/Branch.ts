import mongoose, { Schema } from 'mongoose';
import { Branch as BranchInterface } from '../types/index.js';

const BranchSchema = new Schema<BranchInterface>({
  key: { 
    type: String, 
    enum: ['JEE', 'NEET'], 
    unique: true,
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
}, { 
  timestamps: true 
});

export const Branch = mongoose.model<BranchInterface>('Branch', BranchSchema);
