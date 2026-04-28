import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { PitchInterest as PitchInterestT } from '@/types/models';

const PitchInterestSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    startupId: { type: String, required: true, ref: 'Startup' },
    investorId: { type: String, required: true, ref: 'User' },
    status: { type: String, default: 'INTERESTED' },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

PitchInterestSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

PitchInterestSchema.virtual('startup', {
  ref: 'Startup',
  localField: 'startupId',
  foreignField: '_id',
  justOne: true,
});

PitchInterestSchema.virtual('investor', {
  ref: 'User',
  localField: 'investorId',
  foreignField: '_id',
  justOne: true,
});

applyVirtuals(PitchInterestSchema);

export const PitchInterest: Model<PitchInterestT> =
  (mongoose.models.PitchInterest as Model<PitchInterestT>) ||
  mongoose.model<PitchInterestT>('PitchInterest', PitchInterestSchema);
