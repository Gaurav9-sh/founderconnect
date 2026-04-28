import { connectDB } from '@/lib/db';
import { Post, PostLike, Comment, Notification } from '@/models';
import { postSchema, commentSchema } from '@/lib/validation';
import type {
  Post as PostT,
  Comment as CommentT,
  UserWithProfile,
} from '@/types/models';

type Counts = { likes: number; comments: number; forwards: number };

type FeedAuthored = PostT & { author: UserWithProfile };
export type FeedPost = FeedAuthored & {
  originalPost: (FeedAuthored & { _count: Counts }) | null;
  _count: Counts;
  likedByMe: boolean;
};
export type PostDetail = FeedPost & {
  comments: (CommentT & { author: UserWithProfile })[];
};

async function countsFor(postId: string): Promise<Counts> {
  const [likes, comments, forwards] = await Promise.all([
    PostLike.countDocuments({ postId }),
    Comment.countDocuments({ postId }),
    Post.countDocuments({ originalPostId: postId }),
  ]);
  return { likes, comments, forwards };
}

export async function createPost(authorId: string, input: unknown) {
  await connectDB();
  const data = postSchema.parse(input);
  return Post.create({
    authorId,
    body: data.body,
    imageUrl: data.imageUrl || null,
  });
}

export async function forwardPost(authorId: string, originalPostId: string, body?: string) {
  await connectDB();
  const original = await Post.findById(originalPostId);
  if (!original) throw new Error('Original post not found');
  const rootId = original.originalPostId ?? original.id;
  return Post.create({
    authorId,
    body: (body ?? '').slice(0, 5000),
    originalPostId: rootId,
  });
}

export async function toggleLike(userId: string, postId: string) {
  await connectDB();
  const existing = await PostLike.findOne({ postId, userId });
  if (existing) {
    await PostLike.deleteOne({ _id: existing._id });
    return { liked: false };
  }
  await PostLike.create({ postId, userId });
  return { liked: true };
}

export async function addComment(authorId: string, input: unknown) {
  await connectDB();
  const data = commentSchema.parse(input);
  const post = await Post.findById(data.postId);
  if (!post) throw new Error('Post not found');

  const comment = await Comment.create({
    authorId,
    postId: data.postId,
    body: data.body,
  });

  if (post.authorId !== authorId) {
    await Notification.create({
      userId: post.authorId,
      type: 'POST_COMMENT',
      payload: JSON.stringify({ postId: post.id, fromUserId: authorId }),
    });
  }

  return comment;
}

type RawPost = Record<string, unknown> & { id: string; originalPost?: unknown };
type DecoratedPost = Record<string, unknown> & {
  id: string;
  _count: Counts;
  originalPost: (Record<string, unknown> & { _count: Counts }) | null;
};

async function decoratePost(post: RawPost): Promise<DecoratedPost> {
  const _count = await countsFor(post.id);
  let originalPost: (Record<string, unknown> & { _count: Counts }) | null = null;
  if (post.originalPost && typeof post.originalPost === 'object') {
    const orig = post.originalPost as { id: string } & Record<string, unknown>;
    originalPost = { ...orig, _count: await countsFor(orig.id) };
  }
  return { ...post, _count, originalPost };
}

export async function listFeed(
  viewerId: string | null,
  take = 30,
): Promise<FeedPost[]> {
  await connectDB();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(take)
    .populate({ path: 'author', populate: { path: 'profile' } })
    .populate({
      path: 'originalPost',
      populate: { path: 'author', populate: { path: 'profile' } },
    })
    .lean({ virtuals: true });

  const decorated = await Promise.all(
    posts.map((p) => decoratePost(p as unknown as RawPost)),
  );

  if (!viewerId)
    return decorated.map((p) => ({ ...p, likedByMe: false })) as unknown as FeedPost[];

  const liked = await PostLike.find({
    userId: viewerId,
    postId: { $in: decorated.map((p) => p.id) },
  })
    .select('postId')
    .lean();
  const likedSet = new Set(liked.map((l) => l.postId as unknown as string));
  return decorated.map((p) => ({
    ...p,
    likedByMe: likedSet.has(p.id),
  })) as unknown as FeedPost[];
}

export async function getPost(
  viewerId: string | null,
  id: string,
): Promise<PostDetail | null> {
  await connectDB();
  const post = await Post.findById(id)
    .populate({ path: 'author', populate: { path: 'profile' } })
    .populate({
      path: 'originalPost',
      populate: { path: 'author', populate: { path: 'profile' } },
    })
    .lean({ virtuals: true });
  if (!post) return null;

  const decorated = await decoratePost(post as unknown as RawPost);
  const comments = await Comment.find({ postId: id })
    .sort({ createdAt: 1 })
    .populate({ path: 'author', populate: { path: 'profile' } })
    .lean({ virtuals: true });

  const likedByMe = viewerId
    ? !!(await PostLike.findOne({ postId: id, userId: viewerId }))
    : false;
  return { ...decorated, comments, likedByMe } as unknown as PostDetail;
}
