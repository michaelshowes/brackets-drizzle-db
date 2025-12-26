import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tournament } from './tournament';
import { participantMatchResult } from './match';
import { participantMatchGameResult } from './match-game';

// A participant of a stage (team or individual).
export const participant = pgTable('Participant', {
    id: text('id').primaryKey(),
    tournamentId: text('tournamentId')
        .notNull()
        .references(() => tournament.id),
    // Name of the participant
    name: text('name').notNull(),
    // Additional data for the participant
    extra: jsonb('extra'),
});

export const participantRelations = relations(participant, ({ one, many }) => ({
    tournament: one(tournament, {
        fields: [participant.tournamentId],
        references: [tournament.id],
    }),
    matchResults: many(participantMatchResult),
    matchGameResults: many(participantMatchGameResult),
}));

export type Participant = typeof participant.$inferSelect;
export type NewParticipant = typeof participant.$inferInsert;

