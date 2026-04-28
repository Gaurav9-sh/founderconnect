import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import {
  User,
  Profile,
  Startup,
  Connection,
  Post,
  PostLike,
  Comment,
} from '../models';

async function main() {
  await connectDB();

  // Wipe existing data so reseeding is idempotent.
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Startup.deleteMany({}),
    Connection.deleteMany({}),
    Post.deleteMany({}),
    PostLike.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  const pw = await bcrypt.hash('password123', 10);

  const ada = await User.create({
    email: 'ada@founder.dev',
    name: 'Ada Chen',
    role: 'FOUNDER',
    passwordHash: pw,
  });
  await Profile.create({
    userId: ada.id,
    headline: 'Building the future of developer tools',
    bio: 'Second-time founder. Previously ML eng at a unicorn.',
    location: 'San Francisco',
    skills: 'TypeScript,React,ML,Go',
    experience: '7 years across infra + AI',
    linkedin: 'https://linkedin.com/in/ada',
  });

  const reid = await User.create({
    email: 'reid@mentor.dev',
    name: 'Reid Parker',
    role: 'MENTOR',
    passwordHash: pw,
  });
  await Profile.create({
    userId: reid.id,
    headline: 'Ex-CEO @ ScaleCo, advising seed-stage SaaS',
    bio: 'Scaled ScaleCo from 0 → $80M ARR. Now advising.',
    location: 'New York',
    skills: 'GTM,Hiring,Pricing,Fundraising',
    mentorshipAreas: 'B2B SaaS,GTM,Fundraising',
    linkedin: 'https://linkedin.com/in/reid',
  });

  const vita = await User.create({
    email: 'vita@capital.vc',
    name: 'Vita Kumar',
    role: 'INVESTOR',
    passwordHash: pw,
  });
  await Profile.create({
    userId: vita.id,
    headline: 'Partner @ Northwind Capital — seed & pre-seed',
    bio: 'Leading $250k–$2M checks in B2B SaaS, devtools, AI infra.',
    location: 'London',
    investmentFocus: 'SaaS,DevTools,AI,Fintech',
    checkSizeMin: 250_000,
    checkSizeMax: 2_000_000,
  });

  await Startup.create({
    founderId: ada.id,
    name: 'Lumen',
    tagline: 'Observability for LLM pipelines',
    description:
      'Lumen gives AI teams traces, evals and cost analytics across every LLM call in production. Integrates in one line.',
    category: 'DevTools',
    stage: 'MVP',
    location: 'San Francisco',
    website: 'https://lumen.example.com',
    fundingGoal: 1_500_000,
    raisedAmount: 300_000,
    traction: '120 teams on beta, $8k MRR, 3 design partners',
  });

  await Connection.create({
    requesterId: ada.id,
    receiverId: reid.id,
    status: 'PENDING',
  });

  const post1 = await Post.create({
    authorId: ada.id,
    body:
      "Just shipped the first version of Lumen's eval dashboard 🎉\n\nLooking for 5 more design partners — AI teams running production LLM pipelines. DM if interested.",
  });

  await Post.create({
    authorId: reid.id,
    body:
      'Unpopular opinion: founders over-index on pitch decks and under-index on weekly investor updates. The update is what actually builds trust.',
  });

  await Comment.create({
    postId: post1.id,
    authorId: reid.id,
    body: "Congrats on shipping! Happy to make a few intros to AI infra teams I'm advising.",
  });
  await PostLike.create({ postId: post1.id, userId: reid.id });

  console.log(
    'Seeded 3 users + 1 startup + 2 posts. Login with any seeded email + password123',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
