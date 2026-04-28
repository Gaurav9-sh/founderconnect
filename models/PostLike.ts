import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { PostLike as PostLikeT } from '@/types/models';

const PostLikeSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    postId: { type: String, required: true, ref: 'Post', index: true },
    userId: { type: String, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

applyVirtuals(PostLikeSchema);

export const PostLike: Model<PostLikeT> =
  (mongoose.models.PostLike as Model<PostLikeT>) ||
  mongoose.model<PostLikeT>('PostLike', PostLikeSchema);
