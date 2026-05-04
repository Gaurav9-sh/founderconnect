import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { User as UserT } from '@/types/models';

const UserSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['FOUNDER', 'INVESTOR', 'MENTOR'],
      required: true,
      default: 'FOUNDER',
    },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

UserSchema.virtual('startups', {
  ref: 'Startup',
  localField: '_id',
  foreignField: 'founderId',
  justOne: false,
});

applyVirtuals(UserSchema);

export const User: Model<UserT> =
  (mongoose.models.User as Model<UserT>) ||
  mongoose.model<UserT>('User', UserSchema);
