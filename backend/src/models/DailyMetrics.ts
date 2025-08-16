import mongoose, { Schema } from 'mongoose';
import { DailyMetrics as DailyMetricsInterface, BranchBreakdown } from '../types/index.js';

const BranchBreakdownSchema = new Schema<BranchBreakdown>({
  branchId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Branch',
    required: true 
  },
  sessions: { 
    type: Number, 
    default: 0 
  },
  avgScore: { 
    type: Number, 
    default: 0 
  },
}, { _id: false });

const DailyMetricsSchema = new Schema<DailyMetricsInterface>({
  date: { 
    type: String, 
    index: true,
    required: true 
  },
  newUsers: { 
    type: Number, 
    default: 0 
  },
  activeUsers: { 
    type: Number, 
    default: 0 
  },
  sessionsStarted: { 
    type: Number, 
    default: 0 
  },
  sessionsCompleted: { 
    type: Number, 
    default: 0 
  },
  avgScore: { 
    type: Number, 
    default: 0 
  },
  branchBreakdown: [BranchBreakdownSchema],
}, { 
  timestamps: true 
});

DailyMetricsSchema.index({ date: 1 }, { unique: true });

export const DailyMetrics = mongoose.model<DailyMetricsInterface>('DailyMetrics', DailyMetricsSchema);
