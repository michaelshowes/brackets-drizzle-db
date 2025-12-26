import { pgEnum } from 'drizzle-orm/pg-core';

// The only supported types of stage.
export const stageTypeEnum = pgEnum('StageType', [
    'ROUND_ROBIN',
    'SINGLE_ELIMINATION',
    'DOUBLE_ELIMINATION',
]);

// The possible types for a double elimination stage's grand final.
export const grandFinalTypeEnum = pgEnum('GrandFinalType', [
    'NONE',
    'SIMPLE',
    'DOUBLE',
]);

// The possible modes for a round-robin stage.
export const roundRobinModeEnum = pgEnum('RoundRobinMode', ['SIMPLE', 'DOUBLE']);

// Used to order seeds.
export const seedOrderingEnum = pgEnum('SeedOrdering', [
    'NATURAL',
    'REVERSE',
    'HALF_SHIFT',
    'REVERSE_HALF_SHIFT',
    'PAIR_FLIP',
    'INNER_OUTER',
    'GROUPS_EFFORT_BALANCED',
    'GROUPS_SEED_OPTIMIZED',
    'GROUPS_BRACKET_OPTIMIZED',
]);

// The possible results of a duel for a participant.
export const matchResultEnum = pgEnum('MatchResult', ['WIN', 'DRAW', 'LOSS']);

// The possible status for a match.
export const matchStatusEnum = pgEnum('MatchStatus', [
    'LOCKED',
    'WAITING',
    'READY',
    'RUNNING',
    'COMPLETED',
    'ARCHIVED',
]);

// Type exports for use in transformers
export type StageType = (typeof stageTypeEnum.enumValues)[number];
export type GrandFinalType = (typeof grandFinalTypeEnum.enumValues)[number];
export type RoundRobinMode = (typeof roundRobinModeEnum.enumValues)[number];
export type SeedOrdering = (typeof seedOrderingEnum.enumValues)[number];
export type MatchResult = (typeof matchResultEnum.enumValues)[number];
export type MatchStatus = (typeof matchStatusEnum.enumValues)[number];

