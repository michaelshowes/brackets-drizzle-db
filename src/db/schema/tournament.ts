import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stage } from './stage';
import { participant } from './participant';

// A tournament that can contain multiple stages and participants.
export const tournament = pgTable('Tournament', {
    id: text('id').primaryKey(),
    // Name of the tournament
    name: text('name').notNull(),
    // Description of the tournament
    description: text('description'),
    // Start date of the tournament
    startDate: timestamp('startDate'),
    // End date of the tournament
    endDate: timestamp('endDate'),
    // Additional data for the tournament
    extra: jsonb('extra'),
});

export const tournamentRelations = relations(tournament, ({ many }) => ({
    stages: many(stage),
    participants: many(participant),
}));

export type Tournament = typeof tournament.$inferSelect;
export type NewTournament = typeof tournament.$inferInsert;
