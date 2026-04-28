import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Connection as ConnectionT } from '@/types/models';

const ConnectionSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    requesterId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    status: { type: String, default: 'PENDING' }, // PENDING | ACCEPTED | REJECTED
    message: { type: String, default: null },
  },
  { _id: false, timestamps: true },
);

ConnectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });
ConnectionSchema.index({ receiverId: 1, status: 1 });

ConnectionSchema.virtual('requester', {
  ref: 'User',
  localField: 'requesterId',
  foreignField: '_id',
  justOne: true,
});

ConnectionSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
});

applyVirtuals(ConnectionSchema);

export const Connection: Model<ConnectionT> =
  (mongoose.models.Connection as Model<ConnectionT>) ||
  mongoose.model<ConnectionT>('Connection', ConnectionSchema);
