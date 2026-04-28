import { connectDB } from '@/lib/db';
import { Connection, Notification } from '@/models';
import { connectionSchema } from '@/lib/validation';
import type { ConnectionStatus } from '@/lib/enums';
import type {
  ConnectionWithUsers,
  ConnectionWithRequester,
  Connection as ConnectionT,
} from '@/types/models';

export async function sendRequest(requesterId: string, input: unknown) {
  await connectDB();
  const data = connectionSchema.parse(input);
  if (data.receiverId === requesterId) throw new Error('Cannot connect to yourself');

  const existing = await Connection.findOne({
    $or: [
      { requesterId, receiverId: data.receiverId },
      { requesterId: data.receiverId, receiverId: requesterId },
    ],
  });
  if (existing) throw new Error('Connection already exists');

  const conn = await Connection.create({
    requesterId,
    receiverId: data.receiverId,
    message: data.message ?? null,
  });

  await Notification.create({
    userId: data.receiverId,
    type: 'CONNECTION_REQUEST',
    payload: JSON.stringify({ connectionId: conn.id, fromUserId: requesterId }),
  });

  return conn;
}

export async function respondToRequest(
  userId: string,
  connectionId: string,
  accept: boolean,
) {
  await connectDB();
  const conn = await Connection.findById(connectionId);
  if (!conn || conn.receiverId !== userId) throw new Error('Not found');
  if (conn.status !== 'PENDING') throw new Error('Already handled');

  const status: ConnectionStatus = accept ? 'ACCEPTED' : 'REJECTED';
  conn.status = status;
  await conn.save();

  if (accept) {
    await Notification.create({
      userId: conn.requesterId,
      type: 'CONNECTION_ACCEPTED',
      payload: JSON.stringify({ byUserId: userId }),
    });
  }
  return conn;
}

export async function listConnections(
  userId: string,
): Promise<ConnectionWithUsers[]> {
  await connectDB();
  const docs = await Connection.find({
    status: 'ACCEPTED',
    $or: [{ requesterId: userId }, { receiverId: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate({ path: 'requester', populate: { path: 'profile' } })
    .populate({ path: 'receiver', populate: { path: 'profile' } })
    .lean({ virtuals: true });
  return docs as unknown as ConnectionWithUsers[];
}

export async function listPendingForMe(
  userId: string,
): Promise<ConnectionWithRequester[]> {
  await connectDB();
  const docs = await Connection.find({ receiverId: userId, status: 'PENDING' })
    .sort({ createdAt: -1 })
    .populate({ path: 'requester', populate: { path: 'profile' } })
    .lean({ virtuals: true });
  return docs as unknown as ConnectionWithRequester[];
}

export async function connectionBetween(
  a: string,
  b: string,
): Promise<ConnectionT | null> {
  await connectDB();
  const doc = await Connection.findOne({
    $or: [
      { requesterId: a, receiverId: b },
      { requesterId: b, receiverId: a },
    ],
  }).lean({ virtuals: true });
  return doc as unknown as ConnectionT | null;
}
