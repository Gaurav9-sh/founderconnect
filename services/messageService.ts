import { connectDB } from '@/lib/db';
import { Message, Notification } from '@/models';
import { messageSchema } from '@/lib/validation';
import { connectionBetween } from './connectionService';

export async function sendMessage(senderId: string, input: unknown) {
  await connectDB();
  const data = messageSchema.parse(input);
  if (data.receiverId === senderId) throw new Error('Cannot message yourself');

  const conn = await connectionBetween(senderId, data.receiverId);
  if (!conn || conn.status !== 'ACCEPTED')
    throw new Error('You must be connected to send messages');

  const msg = await Message.create({
    senderId,
    receiverId: data.receiverId,
    body: data.body,
  });

  await Notification.create({
    userId: data.receiverId,
    type: 'MESSAGE',
    payload: JSON.stringify({ fromUserId: senderId, messageId: msg.id }),
  });

  return msg;
}

export async function listThreads(userId: string) {
  await connectDB();
  const msgs = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate({ path: 'sender', select: 'name' })
    .populate({ path: 'receiver', select: 'name' })
    .lean({ virtuals: true });

  type Populated = (typeof msgs)[number] & {
    sender: { id: string; name: string };
    receiver: { id: string; name: string };
  };

  const threads = new Map<
    string,
    { otherId: string; otherName: string; last: string; at: Date }
  >();
  for (const m of msgs as unknown as Populated[]) {
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

export async function listThread(userId: string, otherId: string) {
  await connectDB();
  return Message.find({
    $or: [
      { senderId: userId, receiverId: otherId },
      { senderId: otherId, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .lean({ virtuals: true });
}

export async function markThreadRead(userId: string, otherId: string) {
  await connectDB();
  await Message.updateMany(
    { receiverId: userId, senderId: otherId, readAt: null },
    { $set: { readAt: new Date() } },
  );
}
