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
  Message,
  Notification,
  PitchInterest,
} from '../models';

// Stable, public CDN images. Pravatar serves the same face for the same `img` index,
// Unsplash photo URLs are pinned by ID, and DiceBear renders deterministic SVG logos.
const avatar = (n: number) => `https://i.pravatar.cc/300?img=${n}`;
const startupLogo = (seed: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0ea5e9,6366f1,22c55e,f59e0b,ef4444`;
const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

async function main() {
  await connectDB();

  // Wipe every collection so the seed is idempotent.
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Startup.deleteMany({}),
    Connection.deleteMany({}),
    Post.deleteMany({}),
    PostLike.deleteMany({}),
    Comment.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    PitchInterest.deleteMany({}),
  ]);

  const pw = await bcrypt.hash('password123', 10);

  /* ---------------------------------------------------------------- USERS */
  // 3 founders, 2 mentors, 3 investors = 8 total.
  const [ada, ravi, mia, reid, hana, vita, omar, lina] = await User.insertMany([
    { email: 'ada@founder.dev',     name: 'Ada Chen',        role: 'FOUNDER',  passwordHash: pw },
    { email: 'ravi@founder.dev',    name: 'Ravi Mehta',      role: 'FOUNDER',  passwordHash: pw },
    { email: 'mia@founder.dev',     name: 'Mia Alvarez',     role: 'FOUNDER',  passwordHash: pw },
    { email: 'reid@mentor.dev',     name: 'Reid Parker',     role: 'MENTOR',   passwordHash: pw },
    { email: 'hana@mentor.dev',     name: 'Hana Yamamoto',   role: 'MENTOR',   passwordHash: pw },
    { email: 'vita@capital.vc',     name: 'Vita Kumar',      role: 'INVESTOR', passwordHash: pw },
    { email: 'omar@northstar.vc',   name: 'Omar El-Sayed',   role: 'INVESTOR', passwordHash: pw },
    { email: 'lina@seedforge.vc',   name: 'Lina Petrova',    role: 'INVESTOR', passwordHash: pw },
  ]);

  /* -------------------------------------------------------------- PROFILES */
  await Profile.insertMany([
    {
      userId: ada.id,
      headline: 'Building the future of developer tools',
      bio: 'Second-time founder. Previously ML engineer at a unicorn. Obsessed with making AI infrastructure observable and debuggable for small teams.',
      location: 'San Francisco, USA',
      skills: 'TypeScript,React,Python,ML,Go,Kubernetes',
      experience: '7 years across infra + AI; ex-Stripe, ex-Scale AI',
      website: 'https://adachen.dev',
      linkedin: 'https://linkedin.com/in/adachen',
      twitter: 'https://twitter.com/adachen',
      avatarUrl: avatar(47),
    },
    {
      userId: ravi.id,
      headline: 'Founder @ GreenLedger — climate fintech for SMBs',
      bio: 'Helping small businesses measure and offset Scope 1/2/3 emissions with one API. Previously product lead at a B2B fintech.',
      location: 'Bengaluru, India',
      skills: 'Product,Fintech,Climate,Node.js,SQL',
      experience: '9 years in fintech & ESG analytics',
      linkedin: 'https://linkedin.com/in/ravimehta',
      avatarUrl: avatar(12),
    },
    {
      userId: mia.id,
      headline: 'Founder @ Pantry — AI nutrition coaching',
      bio: 'Building a nutrition coach that actually understands your kitchen. Ex-nutritionist turned founder. Y Combinator W24.',
      location: 'Austin, USA',
      skills: 'Mobile,Swift,React Native,Nutrition,Growth',
      experience: '5 years in consumer health',
      linkedin: 'https://linkedin.com/in/miaalvarez',
      twitter: 'https://twitter.com/miacooks',
      avatarUrl: avatar(32),
    },
    {
      userId: reid.id,
      headline: 'Ex-CEO @ ScaleCo, advising seed-stage SaaS',
      bio: 'Scaled ScaleCo from 0 → $80M ARR over six years. Now advising 12 seed-stage B2B SaaS founders on GTM, pricing, and the first 10 enterprise hires.',
      location: 'New York, USA',
      skills: 'GTM,Hiring,Pricing,Fundraising,Enterprise Sales',
      mentorshipAreas: 'B2B SaaS,GTM,Fundraising,Org Design',
      linkedin: 'https://linkedin.com/in/reidparker',
      avatarUrl: avatar(60),
    },
    {
      userId: hana.id,
      headline: 'Product mentor — ex-Director of Product at a unicorn',
      bio: 'Ten years shipping consumer & prosumer products. I help founders sharpen positioning and design their first real product roadmap.',
      location: 'Tokyo, Japan',
      skills: 'Product Strategy,UX Research,Pricing,Roadmapping',
      mentorshipAreas: 'Consumer,Product Strategy,Positioning',
      website: 'https://hanayamamoto.co',
      linkedin: 'https://linkedin.com/in/hanayamamoto',
      avatarUrl: avatar(45),
    },
    {
      userId: vita.id,
      headline: 'Partner @ Northwind Capital — seed & pre-seed',
      bio: 'Leading $250k–$2M checks in B2B SaaS, devtools, and AI infra. 18 portfolio companies, 3 exits in the last cycle.',
      location: 'London, UK',
      skills: 'Diligence,Term Sheets,Board Work',
      investmentFocus: 'SaaS,DevTools,AI,Fintech',
      checkSizeMin: 250_000,
      checkSizeMax: 2_000_000,
      linkedin: 'https://linkedin.com/in/vitakumar',
      avatarUrl: avatar(48),
    },
    {
      userId: omar.id,
      headline: 'GP @ Northstar Ventures — climate & deeptech',
      bio: 'Backing technical founders solving hard physical-world problems. Climate, energy, robotics, materials.',
      location: 'Berlin, Germany',
      investmentFocus: 'Climate,Energy,Deeptech,Robotics',
      checkSizeMin: 500_000,
      checkSizeMax: 4_000_000,
      linkedin: 'https://linkedin.com/in/omarelsayed',
      avatarUrl: avatar(13),
    },
    {
      userId: lina.id,
      headline: 'Solo GP @ SeedForge — pre-seed checks for technical founders',
      bio: 'First check in 30+ companies. I move fast, write $50k–$300k, and stay out of the way after.',
      location: 'Lisbon, Portugal',
      investmentFocus: 'DevTools,Infra,Open Source,AI',
      checkSizeMin: 50_000,
      checkSizeMax: 300_000,
      twitter: 'https://twitter.com/linapetrova',
      linkedin: 'https://linkedin.com/in/linapetrova',
      avatarUrl: avatar(44),
    },
  ]);

  /* -------------------------------------------------------------- STARTUPS */
  const [lumen, greenledger, pantry, helix, cobalt, , beacon] =
    await Startup.insertMany([
      {
        founderId: ada.id,
        name: 'Lumen',
        tagline: 'Observability for LLM pipelines',
        description:
          'Lumen gives AI teams traces, evals, and cost analytics across every LLM call in production. One-line SDK install for Python and TypeScript, dashboards out of the box, and automatic alerting when prompt regressions hit.',
        category: 'DevTools',
        stage: 'MVP',
        location: 'San Francisco, USA',
        website: 'https://lumen.example.com',
        logoUrl: startupLogo('Lumen'),
        fundingGoal: 1_500_000,
        raisedAmount: 300_000,
        traction: '120 teams on beta · $8k MRR · 3 design partners',
      },
      {
        founderId: ravi.id,
        name: 'GreenLedger',
        tagline: 'Carbon accounting API for SMBs',
        description:
          'GreenLedger turns bank statements and invoices into audit-ready Scope 1/2/3 emissions reports. Built for the 200M small businesses that will face mandatory disclosure by 2027.',
        category: 'Climate / Fintech',
        stage: 'EARLY_TRACTION',
        location: 'Bengaluru, India',
        website: 'https://greenledger.example.com',
        logoUrl: startupLogo('GreenLedger'),
        fundingGoal: 3_000_000,
        raisedAmount: 1_100_000,
        traction: '40 paying customers · $22k MRR · 18% MoM growth',
      },
      {
        founderId: mia.id,
        name: 'Pantry',
        tagline: 'AI nutrition coach that knows what is in your fridge',
        description:
          'Pantry is a mobile-first nutrition app that builds meal plans from what you already own. Computer-vision pantry scan, allergy-aware swaps, and a conversational coach trained on registered-dietitian playbooks.',
        category: 'Consumer Health',
        stage: 'GROWTH',
        location: 'Austin, USA',
        website: 'https://pantry.example.com',
        logoUrl: startupLogo('Pantry'),
        fundingGoal: 5_000_000,
        raisedAmount: 2_400_000,
        traction: '180k MAU · 9k paying subs · 52 NPS',
      },
      {
        founderId: ada.id,
        name: 'Helix Eval',
        tagline: 'Open-source evals harness for production LLMs',
        description:
          'A second product from the Lumen team focused purely on eval pipelines: write evals in YAML, run them on every PR, and gate deploys on regression thresholds. MIT licensed; cloud version in private beta.',
        category: 'DevTools / Open Source',
        stage: 'IDEA',
        location: 'San Francisco, USA',
        website: 'https://helix.example.com',
        logoUrl: startupLogo('HelixEval'),
        fundingGoal: 500_000,
        raisedAmount: 0,
        traction: '2.4k GitHub stars in 6 weeks',
      },
      {
        founderId: ravi.id,
        name: 'Cobalt',
        tagline: 'Battery passport infrastructure for EV manufacturers',
        description:
          'Cobalt issues tamper-evident digital passports for every EV battery cell — required for EU battery regulation 2027. Pilot with two Tier-1 OEMs.',
        category: 'Climate / Hardware',
        stage: 'MVP',
        location: 'Munich, Germany',
        website: 'https://cobalt.example.com',
        logoUrl: startupLogo('Cobalt'),
        fundingGoal: 4_000_000,
        raisedAmount: 600_000,
        traction: '2 OEM pilots signed · $0 MRR (LOIs only)',
      },
      {
        founderId: mia.id,
        name: 'Mosaic',
        tagline: 'Group chat for small wellness communities',
        description:
          'Mosaic is a Discord alternative for wellness creators — paid cohorts, threaded check-ins, and a habit tracker baked in. Spun out of a Pantry user-research finding.',
        category: 'Consumer / Community',
        stage: 'EARLY_TRACTION',
        location: 'Austin, USA',
        website: 'https://mosaic.example.com',
        logoUrl: startupLogo('Mosaic'),
        fundingGoal: 1_200_000,
        raisedAmount: 250_000,
        traction: '34 paid communities · $4.7k MRR',
      },
      {
        founderId: ada.id,
        name: 'Beacon',
        tagline: 'On-call for AI agents in production',
        description:
          'Beacon pages a human when your autonomous agent gets stuck, hallucinates a tool call, or blows past a token budget. PagerDuty-style routing, but for agents.',
        category: 'DevTools / AI Infra',
        stage: 'IDEA',
        location: 'Remote',
        website: 'https://beacon.example.com',
        logoUrl: startupLogo('Beacon'),
        fundingGoal: 800_000,
        raisedAmount: 0,
        traction: 'Concept stage · 50-person waitlist',
      },
    ]);

  /* ----------------------------------------------------------- CONNECTIONS */
  await Connection.insertMany([
    { requesterId: ada.id,  receiverId: reid.id, status: 'ACCEPTED', message: 'Loved your post on weekly investor updates — would value your perspective on Lumen.' },
    { requesterId: ada.id,  receiverId: vita.id, status: 'PENDING',  message: 'Northwind has been on my list for a while — happy to send a memo if useful.' },
    { requesterId: ravi.id, receiverId: omar.id, status: 'ACCEPTED', message: 'GreenLedger is squarely in your climate thesis — would love 20 min.' },
    { requesterId: ravi.id, receiverId: hana.id, status: 'PENDING',  message: 'Heard you mentor on positioning — I am wrestling with our SMB vs enterprise framing.' },
    { requesterId: mia.id,  receiverId: reid.id, status: 'REJECTED', message: 'Pantry is consumer health — open to chatting if you advise outside SaaS?' },
    { requesterId: mia.id,  receiverId: lina.id, status: 'ACCEPTED', message: 'You backed two of our YC batchmates — would love to be in your orbit.' },
    { requesterId: omar.id, receiverId: ada.id,  status: 'PENDING',  message: 'Saw Lumen on Show HN — Northstar would love a first look.' },
    { requesterId: lina.id, receiverId: ravi.id, status: 'ACCEPTED', message: 'Climate fintech is on my radar — quick intro call?' },
  ]);

  /* ---------------------------------------------------------------- POSTS */
  const posts = await Post.insertMany([
    {
      authorId: ada.id,
      body:
        "Just shipped the first version of Lumen's eval dashboard 🎉\n\nLooking for 5 more design partners — AI teams running production LLM pipelines. DM if interested.",
      imageUrl: unsplash('photo-1551434678-e076c223a692'),
    },
    {
      authorId: reid.id,
      body:
        'Unpopular opinion: founders over-index on pitch decks and under-index on weekly investor updates. The update is what actually builds trust between rounds — not the deck.',
    },
    {
      authorId: ravi.id,
      body:
        'GreenLedger crossed $20k MRR this week 🌱\n\nA year ago this was a Notion doc. Lessons from the climb: (1) niche down harder than you think, (2) charge from day one, (3) write the boring case studies.',
      imageUrl: unsplash('photo-1497436072909-60f360e1d4b1'),
    },
    {
      authorId: mia.id,
      body:
        "Pantry hit 180k MAU today. Our retention curve finally flattens at week 8 — took us four redesigns of the onboarding to get there. Happy to share the before/after wireframes if anyone is debugging the same problem.",
      imageUrl: unsplash('photo-1490645935967-10de6ba17061'),
    },
    {
      authorId: vita.id,
      body:
        'We just closed Fund III at £120M. Same thesis: seed-stage B2B SaaS, devtools, AI infra. If you are pre-revenue with a technical founder and a sharp wedge, my inbox is open.',
      imageUrl: unsplash('photo-1556761175-5973dc0f32e7'),
    },
    {
      authorId: hana.id,
      body:
        'Mentoring tip of the week: when a founder cannot describe their target user in one sentence, the product is not the problem — the positioning is. Spend the afternoon rewriting the homepage hero before you touch the roadmap.',
    },
    {
      authorId: omar.id,
      body:
        'Spent the morning at a battery recycling pilot in Bavaria. The hardest problems in climate are not software — they are physical, regulated, and capital-intensive. Worth remembering when you triage your dealflow.',
      imageUrl: unsplash('photo-1473800447596-01729482b8eb'),
    },
    {
      authorId: lina.id,
      body:
        'Wrote a check this morning. Founder pinged me Monday, demo Tuesday, term sheet Wednesday, wired Friday. Pre-seed should not take six weeks of "process" — that is a bad signal from the investor, not the founder.',
    },
  ]);
  const [post1, post2, post3, post4, post5, post6, post7] = posts;

  /* ----------------------------------------------------------- POST LIKES */
  await PostLike.insertMany([
    { postId: post1.id, userId: reid.id },
    { postId: post1.id, userId: vita.id },
    { postId: post1.id, userId: lina.id },
    { postId: post3.id, userId: omar.id },
    { postId: post3.id, userId: vita.id },
    { postId: post4.id, userId: hana.id },
    { postId: post5.id, userId: ada.id },
    { postId: post5.id, userId: ravi.id },
    { postId: post7.id, userId: ravi.id },
  ]);

  /* ------------------------------------------------------------- COMMENTS */
  await Comment.insertMany([
    { postId: post1.id, authorId: reid.id, body: "Congrats on shipping! Happy to make a few intros to AI infra teams I'm advising." },
    { postId: post1.id, authorId: vita.id, body: 'Sent a DM — would love an early demo before next partner meeting.' },
    { postId: post2.id, authorId: ada.id,  body: 'Hard agree. Our weekly update is the single highest-leverage 30 minutes of my week.' },
    { postId: post3.id, authorId: omar.id, body: 'Numbers look real. Northstar would like a deeper look — pinging you separately.' },
    { postId: post4.id, authorId: hana.id, body: "Would love to see the onboarding before/after — DMing you." },
    { postId: post5.id, authorId: ravi.id, body: 'Congrats on the close. Curious what your conviction signal was for AI infra in this market.' },
    { postId: post6.id, authorId: mia.id,  body: 'This rewired how I think about our hero copy. Thank you.' },
    { postId: post7.id, authorId: ravi.id, body: 'Great point — I learned this the hard way at GreenLedger when our software roadmap kept colliding with regulator timelines.' },
  ]);

  /* ------------------------------------------------------------- MESSAGES */
  await Message.insertMany([
    { senderId: ada.id,  receiverId: reid.id, body: 'Reid — thanks for accepting. Would love 20 min on Lumen pricing whenever works.', readAt: new Date('2026-04-28T10:00:00Z') },
    { senderId: reid.id, receiverId: ada.id,  body: 'Friday 2pm PT? Send the latest pricing tiers ahead of the call.',                  readAt: new Date('2026-04-28T11:30:00Z') },
    { senderId: ada.id,  receiverId: reid.id, body: 'Perfect, calendar invite incoming. Sharing a doc with our 3 tier sketches.',                                                              },
    { senderId: ravi.id, receiverId: omar.id, body: 'Omar — sending the GreenLedger memo. The OEM pilot data is on page 7.',          readAt: new Date('2026-05-01T08:00:00Z') },
    { senderId: omar.id, receiverId: ravi.id, body: 'Read it twice. Numbers stand up. Lets get on a call with my partner Thursday.',  readAt: new Date('2026-05-01T09:15:00Z') },
    { senderId: mia.id,  receiverId: lina.id, body: 'Lina — Pantry is opening a small SAFE round. Saved you a slot if useful.',                                                                 },
    { senderId: lina.id, receiverId: mia.id,  body: 'Yes please. Send the SAFE doc + last 3 months KPIs and I will turn it around in 48h.',                                                     },
    { senderId: ada.id,  receiverId: vita.id, body: 'Vita — followed up on LinkedIn but reaching here too. Memo + 2 min Loom attached.',                                                       },
  ]);

  /* --------------------------------------------------------- NOTIFICATIONS */
  await Notification.insertMany([
    { userId: reid.id, type: 'CONNECTION_REQUEST',  payload: JSON.stringify({ requesterId: ada.id,  requesterName: 'Ada Chen' }),                       readAt: new Date() },
    { userId: vita.id, type: 'CONNECTION_REQUEST',  payload: JSON.stringify({ requesterId: ada.id,  requesterName: 'Ada Chen' }) },
    { userId: ada.id,  type: 'CONNECTION_ACCEPTED', payload: JSON.stringify({ userId: reid.id,      userName: 'Reid Parker' }),                         readAt: new Date() },
    { userId: ada.id,  type: 'POST_LIKED',          payload: JSON.stringify({ postId: post1.id,     likerId: vita.id, likerName: 'Vita Kumar' }) },
    { userId: ada.id,  type: 'POST_COMMENTED',      payload: JSON.stringify({ postId: post1.id,     commenterId: reid.id, commenterName: 'Reid Parker' }) },
    { userId: ravi.id, type: 'PITCH_INTEREST',      payload: JSON.stringify({ startupId: greenledger.id, investorId: omar.id, investorName: 'Omar El-Sayed' }) },
    { userId: ada.id,  type: 'PITCH_INTEREST',      payload: JSON.stringify({ startupId: lumen.id,  investorId: vita.id, investorName: 'Vita Kumar' }) },
    { userId: mia.id,  type: 'NEW_MESSAGE',         payload: JSON.stringify({ fromId: lina.id,      fromName: 'Lina Petrova', preview: 'Yes please. Send the SAFE doc...' }) },
    { userId: ravi.id, type: 'NEW_MESSAGE',         payload: JSON.stringify({ fromId: omar.id,      fromName: 'Omar El-Sayed', preview: 'Read it twice. Numbers stand up...' }),         readAt: new Date() },
  ]);

  /* -------------------------------------------------------- PITCH INTEREST */
  await PitchInterest.insertMany([
    { startupId: lumen.id,       investorId: vita.id, status: 'MEETING',    note: 'Booked 30 min next Tuesday — wants to dig into eval methodology.' },
    { startupId: lumen.id,       investorId: lina.id, status: 'INTERESTED', note: 'Loved the Show HN traction. Watching for Series Seed.' },
    { startupId: greenledger.id, investorId: omar.id, status: 'INVESTED',   note: 'Led $1.1M seed at $9M post. Board observer.' },
    { startupId: greenledger.id, investorId: vita.id, status: 'PASSED',     note: 'Climate is outside our active thesis — but please update us next round.' },
    { startupId: pantry.id,      investorId: lina.id, status: 'INTERESTED', note: 'Consumer is not my usual lane but the retention curve is exceptional.' },
    { startupId: cobalt.id,      investorId: omar.id, status: 'MEETING',    note: 'Diligence call with my hardware partner scheduled.' },
    { startupId: helix.id,       investorId: lina.id, status: 'INTERESTED', note: 'Open-source-first is exactly my thesis. Following the GitHub repo.' },
    { startupId: beacon.id,      investorId: vita.id, status: 'PASSED',     note: 'Too early — revisit when there is a paying design partner.' },
  ]);

  console.log(
    [
      'Seed complete:',
      '  • 8 users (3 founders, 2 mentors, 3 investors)',
      '  • 8 profiles (with avatar images)',
      '  • 7 startups (with logo images)',
      '  • 8 connections',
      '  • 8 posts (5 with images)',
      '  • 9 post likes',
      '  • 8 comments',
      '  • 8 messages',
      '  • 9 notifications',
      '  • 8 pitch interests',
      '',
      'Login with any seeded email + password "password123".',
      'Sample logins: ada@founder.dev (FOUNDER), reid@mentor.dev (MENTOR), vita@capital.vc (INVESTOR)',
    ].join('\n'),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
