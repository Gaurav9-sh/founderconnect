import { prisma } from '@/lib/prisma';
import { messageSchema } from '@/lib/validation';
import { connectionBetween } from './connectionService';

export async function sendMessage(senderId: string, input: unknown) {
  const data = messageSchema.parse(input);
  if (data.receiverId === senderId) throw new Error('Cannot message yourself');

  const conn = await connectionBetween(senderId, data.receiverId);
  if (!conn || conn.status !== 'ACCEPTED')
    throw new Error('You must be connected to send messages');

  const msg = await prisma.message.create({
    data: { senderId, receiverId: data.receiverId, body: data.body },
  });

  await prisma.notification.create({
    data: {
      userId: data.receiverId,
      type: 'MESSAGE',
      payload: JSON.stringify({ fromUserId: senderId, messageId: msg.id }),
    },
  });

  return msg;
}

export async function listThreads(userId: string) {
  const msgs = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });
  const threads = new Map<
    string,
    { otherId: string; otherName: string; last: string; at: Date }
  >();
  for (const m of msgs) {
    const other = m.senderId === userId ? m.receiver : m.sender;
    if (!threads.has(other.id)) {
      threads.set(other.id, {
        otherId: other.id,
        otherName: other.name,
        last: m.body,
        at: m.createdAt,
      });
    }
  }
  return [...threads.values()];
}

export function listThread(userId: string, otherId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function markThreadRead(userId: string, otherId: string) {
  await prisma.message.updateMany({
    where: { receiverId: userId, senderId: otherId, readAt: null },
    data: { readAt: new Date() },
  });
}
