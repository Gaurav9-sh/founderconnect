import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Comment as CommentT } from '@/types/models';

const CommentSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    postId: { type: String, required: true, ref: 'Post' },
    authorId: { type: String, required: true, ref: 'User' },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

CommentSchema.index({ postId: 1, createdAt: 1 });

CommentSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

applyVirtuals(CommentSchema);

export const Comment: Model<CommentT> =
  (mongoose.models.Comment as Model<CommentT>) ||
  mongoose.model<CommentT>('Comment', CommentSchema);
