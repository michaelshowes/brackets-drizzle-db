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
import { match } from './match';
import { participant } from './participant';

// A game within a match.
export const matchGame = pgTable('MatchGame', {
    id: text('id').primaryKey(),
    // Status of the match game.
    status: matchStatusEnum('status').notNull(),
    // Additional data for the match game.
    extra: jsonb('extra'),
    // ID of the parent stage.
    stageId: text('stageId')
        .notNull()
        .references(() => stage.id),
    // ID of the parent match.
    matchId: text('matchId')
        .notNull()
        .references(() => match.id),
    // The number of the match game in its match
    number: integer('number').notNull(),
});

export const matchGameRelations = relations(matchGame, ({ one }) => ({
    stage: one(stage, {
        fields: [matchGame.stageId],
        references: [stage.id],
    }),
    match: one(match, {
        fields: [matchGame.matchId],
        references: [match.id],
    }),
    opponent1Result: one(participantMatchGameResult, {
        fields: [matchGame.id],
        references: [participantMatchGameResult.opponent1MatchGameId],
        relationName: 'opponent1',
    }),
    opponent2Result: one(participantMatchGameResult, {
        fields: [matchGame.id],
        references: [participantMatchGameResult.opponent2MatchGameId],
        relationName: 'opponent2',
    }),
}));

// The results of a participant in a match game.
export const participantMatchGameResult = pgTable(
    'ParticipantMatchGameResult',
    {
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
        opponent1MatchGameId: text('opponent1MatchGameId').unique(),
        // Foreign key for opponent2 relation
        opponent2MatchGameId: text('opponent2MatchGameId').unique(),
    },
);

export const participantMatchGameResultRelations = relations(
    participantMatchGameResult,
    ({ one }) => ({
        participant: one(participant, {
            fields: [participantMatchGameResult.participantId],
            references: [participant.id],
        }),
        opponent1MatchGame: one(matchGame, {
            fields: [participantMatchGameResult.opponent1MatchGameId],
            references: [matchGame.id],
            relationName: 'opponent1',
        }),
        opponent2MatchGame: one(matchGame, {
            fields: [participantMatchGameResult.opponent2MatchGameId],
            references: [matchGame.id],
            relationName: 'opponent2',
        }),
    }),
);

export type MatchGame = typeof matchGame.$inferSelect;
export type NewMatchGame = typeof matchGame.$inferInsert;
export type ParticipantMatchGameResult =
    typeof participantMatchGameResult.$inferSelect;
export type NewParticipantMatchGameResult =
    typeof participantMatchGameResult.$inferInsert;

