import mongoose, { Schema, Model } from 'mongoose';
import { applyVirtuals, stringId } from './_helpers';
import type { Post as PostT } from '@/types/models';

const PostSchema = new Schema(
  {
    _id: { type: String, default: stringId },
    authorId: { type: String, required: true, ref: 'User', index: true },
    body: { type: String, required: true },
    imageUrl: { type: String, default: null },
    originalPostId: { type: String, default: null, ref: 'Post' },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { _id: false },
);

PostSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

PostSchema.virtual('originalPost', {
  ref: 'Post',
  localField: 'originalPostId',
  foreignField: '_id',
  justOne: true,
});

applyVirtuals(PostSchema);

export const Post: Model<PostT> =
  (mongoose.models.Post as Model<PostT>) ||
  mongoose.model<PostT>('Post', PostSchema);
