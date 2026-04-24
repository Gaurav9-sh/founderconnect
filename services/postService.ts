import { prisma } from '@/lib/prisma';
import { postSchema, commentSchema } from '@/lib/validation';

const postInclude = {
  author: { include: { profile: true } },
  originalPost: {
    include: {
      author: { include: { profile: true } },
      _count: { select: { likes: true, comments: true, forwards: true } },
    },
  },
  _count: { select: { likes: true, comments: true, forwards: true } },
} as const;

export async function createPost(authorId: string, input: unknown) {
  const data = postSchema.parse(input);
  return prisma.post.create({
    data: {
      authorId,
      body: data.body,
      imageUrl: data.imageUrl || null,
    },
  });
}

export async function forwardPost(authorId: string, originalPostId: string, body?: string) {
  const original = await prisma.post.findUnique({ where: { id: originalPostId } });
  if (!original) throw new Error('Original post not found');
  // Always forward the root post, not a forward-of-a-forward
  const rootId = original.originalPostId ?? original.id;
  return prisma.post.create({
    data: {
      authorId,
      body: (body ?? '').slice(0, 5000),
      originalPostId: rootId,
    },
  });
}

export async function toggleLike(userId: string, postId: string) {
  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }
  await prisma.postLike.create({ data: { postId, userId } });
  return { liked: true };
}

export async function addComment(authorId: string, input: unknown) {
  const data = commentSchema.parse(input);
  const post = await prisma.post.findUnique({ where: { id: data.postId } });
  if (!post) throw new Error('Post not found');

  const comment = await prisma.comment.create({
    data: { authorId, postId: data.postId, body: data.body },
  });

  if (post.authorId !== authorId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'POST_COMMENT',
        payload: JSON.stringify({ postId: post.id, fromUserId: authorId }),
      },
    });
  }

  return comment;
}

export async function listFeed(viewerId: string | null, take = 30) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: postInclude,
  });

  if (!viewerId) return posts.map((p) => ({ ...p, likedByMe: false }));

  const liked = await prisma.postLike.findMany({
    where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
    select: { postId: true },
  });
  const likedSet = new Set(liked.map((l) => l.postId));
  return posts.map((p) => ({ ...p, likedByMe: likedSet.has(p.id) }));
}

export async function getPost(viewerId: string | null, id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      ...postInclude,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { include: { profile: true } } },
      },
    },
  });
  if (!post) return null;
  const likedByMe = viewerId
    ? !!(await prisma.postLike.findUnique({
        where: { postId_userId: { postId: id, userId: viewerId } },
      }))
    : false;
  return { ...post, likedByMe };
}

export type FeedPost = Awaited<ReturnType<typeof listFeed>>[number];
export type PostDetail = NonNullable<Awaited<ReturnType<typeof getPost>>>;
