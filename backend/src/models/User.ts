import mongoose, { Schema } from 'mongoose';
import { User as UserInterface } from '../types/index.js';

const UserSchema = new Schema<UserInterface>({
  clerkUserId: { 
    type: String, 
    unique: true, 
    index: true,
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student', 
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { 
  timestamps: true 
});

export const User = mongoose.model<UserInterface>('User', UserSchema);
