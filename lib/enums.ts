// App-level enums. SQLite doesn't support Prisma enums, so we keep them here
// as string-literal union types + arrays for validation / iteration.

export const CONNECTION_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const STARTUP_STAGES = [
  'IDEA',
  'MVP',
  'EARLY_TRACTION',
  'GROWTH',
  'SCALING',
] as const;
export type StartupStage = (typeof STARTUP_STAGES)[number];

export const INTEREST_STATUSES = [
  'INTERESTED',
  'MEETING',
  'PASSED',
  'INVESTED',
] as const;
export type InterestStatus = (typeof INTEREST_STATUSES)[number];
