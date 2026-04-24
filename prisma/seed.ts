import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('password123', 10);

  const ada = await prisma.user.create({
    data: {
      email: 'ada@founder.dev',
      name: 'Ada Chen',
      role: 'FOUNDER',
      passwordHash: pw,
      profile: {
        create: {
          headline: 'Building the future of developer tools',
          bio: 'Second-time founder. Previously ML eng at a unicorn.',
          location: 'San Francisco',
          skills: 'TypeScript,React,ML,Go',
          experience: '7 years across infra + AI',
          linkedin: 'https://linkedin.com/in/ada',
        },
      },
    },
  });

  const reid = await prisma.user.create({
    data: {
      email: 'reid@mentor.dev',
      name: 'Reid Parker',
      role: 'MENTOR',
      passwordHash: pw,
      profile: {
        create: {
          headline: 'Ex-CEO @ ScaleCo, advising seed-stage SaaS',
          bio: 'Scaled ScaleCo from 0 → $80M ARR. Now advising.',
          location: 'New York',
          skills: 'GTM,Hiring,Pricing,Fundraising',
          mentorshipAreas: 'B2B SaaS,GTM,Fundraising',
          linkedin: 'https://linkedin.com/in/reid',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'vita@capital.vc',
      name: 'Vita Kumar',
      role: 'INVESTOR',
      passwordHash: pw,
      profile: {
        create: {
          headline: 'Partner @ Northwind Capital — seed & pre-seed',
          bio: 'Leading $250k–$2M checks in B2B SaaS, devtools, AI infra.',
          location: 'London',
          investmentFocus: 'SaaS,DevTools,AI,Fintech',
          checkSizeMin: 250_000,
          checkSizeMax: 2_000_000,
        },
      },
    },
  });

  await prisma.startup.create({
    data: {
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
    },
  });

  await prisma.connection.create({
    data: { requesterId: ada.id, receiverId: reid.id, status: 'PENDING' },
  });

  console.log('Seeded 3 users + 1 startup. Login with any email + password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
