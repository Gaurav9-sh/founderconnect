import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Profile as ProfileT } from '@/types/models';

const ProfileSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    userId: { type: String, required: true, unique: true, ref: 'User' },
    headline: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null },
    skills: { type: String, default: null },
    experience: { type: String, default: null },
    website: { type: String, default: null },
    linkedin: { type: String, default: null },
    twitter: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    investmentFocus: { type: String, default: null },
    checkSizeMin: { type: Number, default: null },
    checkSizeMax: { type: Number, default: null },
    mentorshipAreas: { type: String, default: null },
  },
  { _id: false, timestamps: { createdAt: false, updatedAt: 'updatedAt' } },
);

applyVirtuals(ProfileSchema);

export const Profile: Model<ProfileT> =
  (mongoose.models.Profile as Model<ProfileT>) ||
  mongoose.model<ProfileT>('Profile', ProfileSchema);
