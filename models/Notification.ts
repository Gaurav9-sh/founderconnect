import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Notification as NotificationT } from '@/types/models';

const NotificationSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    userId: { type: String, required: true, ref: 'User' },
    type: { type: String, required: true },
    payload: { type: String, required: true },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

NotificationSchema.index({ userId: 1, readAt: 1 });

applyVirtuals(NotificationSchema);

export const Notification: Model<NotificationT> =
  (mongoose.models.Notification as Model<NotificationT>) ||
  mongoose.model<NotificationT>('Notification', NotificationSchema);
