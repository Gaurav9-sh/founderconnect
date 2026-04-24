import { prisma } from '@/lib/prisma';
import { connectionSchema } from '@/lib/validation';
import type { ConnectionStatus } from '@/lib/enums';

export async function sendRequest(requesterId: string, input: unknown) {
  const data = connectionSchema.parse(input);
  if (data.receiverId === requesterId) throw new Error('Cannot connect to yourself');

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, receiverId: data.receiverId },
        { requesterId: data.receiverId, receiverId: requesterId },
      ],
    },
  });
  if (existing) throw new Error('Connection already exists');

  const conn = await prisma.connection.create({
    data: {
      requesterId,
      receiverId: data.receiverId,
      message: data.message ?? null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: data.receiverId,
      type: 'CONNECTION_REQUEST',
      payload: JSON.stringify({ connectionId: conn.id, fromUserId: requesterId }),
    },
  });

  return conn;
}

export async function respondToRequest(
  userId: string,
  connectionId: string,
  accept: boolean,
) {
  const conn = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!conn || conn.receiverId !== userId) throw new Error('Not found');
  if (conn.status !== 'PENDING') throw new Error('Already handled');

  const status: ConnectionStatus = accept ? 'ACCEPTED' : 'REJECTED';
  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status },
  });

  if (accept) {
    await prisma.notification.create({
      data: {
        userId: conn.requesterId,
        type: 'CONNECTION_ACCEPTED',
        payload: JSON.stringify({ byUserId: userId }),
      },
    });
  }
  return updated;
}

export function listConnections(userId: string) {
  return prisma.connection.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export function listPendingForMe(userId: string) {
  return prisma.connection.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: { requester: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function connectionBetween(a: string, b: string) {
  return prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: a, receiverId: b },
        { requesterId: b, receiverId: a },
      ],
    },
  });
}
