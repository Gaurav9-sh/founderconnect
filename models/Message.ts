import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Message as MessageT } from '@/types/models';

const MessageSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    senderId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    body: { type: String, required: true },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

MessageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true,
});

applyVirtuals(MessageSchema);

export const Message: Model<MessageT> =
  (mongoose.models.Message as Model<MessageT>) ||
  mongoose.model<MessageT>('Message', MessageSchema);
