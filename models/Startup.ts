import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Startup as StartupT } from '@/types/models';

const StartupSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    founderId: { type: String, required: true, ref: 'User', index: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stage: { type: String, required: true },
    location: { type: String, default: null },
    website: { type: String, default: null },
    logoUrl: { type: String, default: null },
    fundingGoal: { type: Number, default: null },
    raisedAmount: { type: Number, default: 0 },
    traction: { type: String, default: null },
    pitchDeckUrl: { type: String, default: null },
  },
  { _id: false, timestamps: true },
);

StartupSchema.virtual('founder', {
  ref: 'User',
  localField: 'founderId',
  foreignField: '_id',
  justOne: true,
});

StartupSchema.virtual('interests', {
  ref: 'PitchInterest',
  localField: '_id',
  foreignField: 'startupId',
  justOne: false,
});

applyVirtuals(StartupSchema);

export const Startup: Model<StartupT> =
  (mongoose.models.Startup as Model<StartupT>) ||
  mongoose.model<StartupT>('Startup', StartupSchema);
