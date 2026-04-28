import { connectDB } from '@/lib/db';
import { Notification } from '@/models';

export async function listNotifications(userId: string, take = 20) {
  await connectDB();
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(take)
    .lean({ virtuals: true });
}

export async function unreadCount(userId: string) {
  await connectDB();
  return Notification.countDocuments({ userId, readAt: null });
}

export async function markAllRead(userId: string) {
  await connectDB();
  return Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
}
