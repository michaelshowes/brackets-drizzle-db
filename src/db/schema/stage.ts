import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
    grandFinalTypeEnum,
    roundRobinModeEnum,
    seedOrderingEnum,
    stageTypeEnum,
} from './enums';
import { tournament } from './tournament';
import { group } from './group';
import { round } from './round';
import { match } from './match';
import { matchGame } from './match-game';

// A stage, which can be a round-robin stage or a single/double elimination stage.
export const stage = pgTable('Stage', {
    id: text('id').primaryKey(),
    tournamentId: text('tournamentId')
        .notNull()
        .references(() => tournament.id),
    // Name of the stage
    name: text('name').notNull(),
    // Type of the stage
    type: stageTypeEnum('type').notNull(),
    // The number of the stage in its tournament
    number: integer('number').notNull(),
});

export const stageRelations = relations(stage, ({ one, many }) => ({
    tournament: one(tournament, {
        fields: [stage.tournamentId],
        references: [tournament.id],
    }),
    settings: one(stageSettings, {
        fields: [stage.id],
        references: [stageSettings.stageId],
    }),
    groups: many(group),
    rounds: many(round),
    matches: many(match),
    matchGames: many(matchGame),
}));

// The possible settings for a stage.
export const stageSettings = pgTable('StageSettings', {
    id: text('id').primaryKey(),
    stageId: text('stageId')
        .notNull()
        .unique()
        .references(() => stage.id),
    // The number of participants
    size: integer('size'),
    // A list of ordering methods to apply to the seeding.
    seedOrdering: seedOrderingEnum('seedOrdering').array(),
    // Whether to balance BYEs in the seeding of an elimination stage.
    balanceByes: boolean('balanceByes'),
    // All matches of the stage will have this child count.
    matchesChildCount: integer('matchesChildCount'),
    // Number of groups in a round-robin stage.
    groupCount: integer('groupCount'),
    // The mode for the round-robin stage.
    roundRobinMode: roundRobinModeEnum('roundRobinMode'),
    // A list of seeds per group for a round-robin stage to be manually ordered.
    manualOrdering: jsonb('manualOrdering'),
    // Optional final between semi-final losers.
    consolationFinal: boolean('consolationFinal'),
    // Whether to skip the first round of the WB of a double elimination stage.
    skipFirstRound: boolean('skipFirstRound'),
    // Optional grand final between WB and LB winners.
    grandFinal: grandFinalTypeEnum('grandFinal'),
});

export const stageSettingsRelations = relations(stageSettings, ({ one }) => ({
    stage: one(stage, {
        fields: [stageSettings.stageId],
        references: [stage.id],
    }),
}));

export type Stage = typeof stage.$inferSelect;
export type NewStage = typeof stage.$inferInsert;
export type StageSettings = typeof stageSettings.$inferSelect;
export type NewStageSettings = typeof stageSettings.$inferInsert;

