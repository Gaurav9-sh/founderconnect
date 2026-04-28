// Plain TypeScript shapes for the documents stored in MongoDB.
// Keep these in sync with the Mongoose schemas in /models.

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
};

export type Profile = {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string | null;
  experience: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  avatarUrl: string | null;
  investmentFocus: string | null;
  checkSizeMin: number | null;
  checkSizeMax: number | null;
  mentorshipAreas: string | null;
  updatedAt: Date;
};

export type Startup = {
  id: string;
  founderId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  location: string | null;
  website: string | null;
  logoUrl: string | null;
  fundingGoal: number | null;
  raisedAmount: number | null;
  traction: string | null;
  pitchDeckUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Connection = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export type PitchInterest = {
  id: string;
  startupId: string;
  investorId: string;
  status: string;
  note: string | null;
  createdAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  payload: string;
  readAt: Date | null;
  createdAt: Date;
};

export type Post = {
  id: string;
  authorId: string;
  body: string;
  imageUrl: string | null;
  originalPostId: string | null;
  createdAt: Date;
};

export type PostLike = {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

// ---------- Populated shapes ----------

export type UserWithProfile = User & { profile: Profile | null };

export type UserWithProfileAndStartups = UserWithProfile & {
  startups: Startup[];
};

export type ConnectionWithUsers = Connection & {
  requester: UserWithProfile;
  receiver: UserWithProfile;
};

export type ConnectionWithRequester = Connection & {
  requester: UserWithProfile;
};

export type StartupWithFounder = Startup & {
  founder: UserWithProfile;
  interests: (PitchInterest & { investor: UserWithProfile })[];
};

export type StartupListItem = Startup & {
  founder: { id: string; name: string };
};

export type StartupWithInterests = Startup & {
  interests: PitchInterest[];
};

export type PitchInterestWithStartup = PitchInterest & {
  startup: Startup & { founder: User };
};
