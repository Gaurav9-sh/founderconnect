import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User, Profile } from '@/models';
import { registerSchema, profileSchema } from '@/lib/validation';
import type { Role } from '@/lib/enums';
import type {
  UserWithProfile,
  UserWithProfileAndStartups,
} from '@/types/models';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function registerUser(input: unknown) {
  await connectDB();
  const data = registerSchema.parse(input);
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    email: data.email,
    name: data.name,
    passwordHash,
    role: data.role,
  });
  await Profile.create({ userId: user.id });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function getUserWithProfile(
  id: string,
): Promise<UserWithProfileAndStartups | null> {
  await connectDB();
  const user = await User.findById(id)
    .populate('profile')
    .populate('startups')
    .lean({ virtuals: true });
  return user as unknown as UserWithProfileAndStartups | null;
}

export async function upsertProfile(userId: string, input: unknown) {
  await connectDB();
  const data = profileSchema.parse(input);
  const cleaned = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  );
  return Profile.findOneAndUpdate(
    { userId },
    { $set: { ...cleaned, userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean({ virtuals: true });
}

export type DiscoveryFilters = {
  role?: Role;
  q?: string;
  skill?: string;
  location?: string;
};

export async function discoverUsers(filters: DiscoveryFilters, take = 30) {
  await connectDB();

  const userMatch: Record<string, unknown> = {};
  if (filters.role) userMatch.role = filters.role;

  // Profile-based filters require an extra round-trip: find matching profiles
  // first, then constrain users by id.
  const profileMatch: Record<string, unknown> = {};
  if (filters.skill)
    profileMatch.skills = new RegExp(escapeRegex(filters.skill), 'i');
  if (filters.location)
    profileMatch.location = new RegExp(escapeRegex(filters.location), 'i');

  if (filters.q) {
    const re = new RegExp(escapeRegex(filters.q), 'i');
    const matchedProfiles = await Profile.find({
      $or: [{ headline: re }, { bio: re }],
    })
      .select('userId')
      .lean();
    userMatch.$or = [
      { name: re },
      { _id: { $in: matchedProfiles.map((p) => p.userId) } },
    ];
  }

  if (Object.keys(profileMatch).length > 0) {
    const matchedProfiles = await Profile.find(profileMatch)
      .select('userId')
      .lean();
    userMatch._id = { $in: matchedProfiles.map((p) => p.userId) };
  }

  const users = await User.find(userMatch)
    .sort({ createdAt: -1 })
    .limit(take)
    .populate('profile')
    .lean({ virtuals: true });
  return users as unknown as UserWithProfile[];
}
