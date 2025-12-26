import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { matchResultEnum, matchStatusEnum } from './enums';
import { stage } from './stage';
import { group } from './group';
import { round } from './round';
import { matchGame } from './match-game';
import { participant } from './participant';

// A match in a round.
export const match = pgTable('Match', {
    id: text('id').primaryKey(),
    // Status of the match.
    status: matchStatusEnum('status').notNull(),
    // ID of the parent stage.
    stageId: text('stageId')
        .notNull()
        .references(() => stage.id),
    // ID of the parent group.
    groupId: text('groupId')
        .notNull()
        .references(() => group.id),
    // ID of the parent round.
    roundId: text('roundId')
        .notNull()
        .references(() => round.id),
    // The number of the match in its round
    number: integer('number').notNull(),
    // The count of match games this match has.
    childCount: integer('childCount').notNull(),
    // Additional data for the match
    extra: jsonb('extra'),
});

export const matchRelations = relations(match, ({ one, many }) => ({
    stage: one(stage, {
        fields: [match.stageId],
        references: [stage.id],
    }),
    group: one(group, {
        fields: [match.groupId],
        references: [group.id],
    }),
    round: one(round, {
        fields: [match.roundId],
        references: [round.id],
    }),
    opponent1Result: one(participantMatchResult, {
        fields: [match.id],
        references: [participantMatchResult.opponent1MatchId],
        relationName: 'opponent1',
    }),
    opponent2Result: one(participantMatchResult, {
        fields: [match.id],
        references: [participantMatchResult.opponent2MatchId],
        relationName: 'opponent2',
    }),
    games: many(matchGame),
}));

// The results of a participant in a match.
export const participantMatchResult = pgTable('ParticipantMatchResult', {
    id: text('id').primaryKey(),
    // If `null`, the participant is to be determined.
    participantId: text('participantId').references(() => participant.id),
    // Indicates where the participant comes from.
    position: integer('position'),
    // If this participant forfeits, the other automatically wins.
    forfeit: boolean('forfeit'),
    // The current score of the participant.
    score: integer('score'),
    // Tells what is the result of a duel for this participant.
    result: matchResultEnum('result'),
    // Foreign key for opponent1 relation
    opponent1MatchId: text('opponent1MatchId').unique(),
    // Foreign key for opponent2 relation
    opponent2MatchId: text('opponent2MatchId').unique(),
});

export const participantMatchResultRelations = relations(
    participantMatchResult,
    ({ one }) => ({
        participant: one(participant, {
            fields: [participantMatchResult.participantId],
            references: [participant.id],
        }),
        opponent1Match: one(match, {
            fields: [participantMatchResult.opponent1MatchId],
            references: [match.id],
            relationName: 'opponent1',
        }),
        opponent2Match: one(match, {
            fields: [participantMatchResult.opponent2MatchId],
            references: [match.id],
            relationName: 'opponent2',
        }),
    }),
);

export type Match = typeof match.$inferSelect;
export type NewMatch = typeof match.$inferInsert;
export type ParticipantMatchResult = typeof participantMatchResult.$inferSelect;
export type NewParticipantMatchResult =
    typeof participantMatchResult.$inferInsert;

