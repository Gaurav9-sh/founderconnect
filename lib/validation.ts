import { z } from 'zod';

export const RoleEnum = z.enum(['FOUNDER', 'MENTOR', 'INVESTOR']);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(8).max(100),
  role: RoleEnum,
});

export const profileSchema = z.object({
  headline: z.string().max(140).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  skills: z.string().max(300).optional().nullable(),
  experience: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  twitter: z.string().url().optional().nullable().or(z.literal('')),
  avatarUrl: z.string().url().optional().nullable().or(z.literal('')),
  investmentFocus: z.string().max(300).optional().nullable(),
  checkSizeMin: z.coerce.number().int().nonnegative().optional().nullable(),
  checkSizeMax: z.coerce.number().int().nonnegative().optional().nullable(),
  mentorshipAreas: z.string().max(300).optional().nullable(),
});

export const startupSchema = z.object({
  name: z.string().min(2).max(80),
  tagline: z.string().min(5).max(160),
  description: z.string().min(20).max(5000),
  category: z.string().min(2).max(50),
  stage: z.enum(['IDEA', 'MVP', 'EARLY_TRACTION', 'GROWTH', 'SCALING']),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  fundingGoal: z.coerce.number().int().nonnegative().optional().nullable(),
  traction: z.string().max(1000).optional().nullable(),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export const connectionSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().max(500).optional(),
});

export const postSchema = z.object({
  body: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(1).max(2000),
});
