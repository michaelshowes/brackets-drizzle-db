import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stage } from './stage';
import { round } from './round';
import { match } from './match';

// A group of a stage.
export const group = pgTable('Group', {
    id: text('id').primaryKey(),
    // ID of the parent stage.
    stageId: text('stageId')
        .notNull()
        .references(() => stage.id),
    // The number of the group in its stage
    number: integer('number').notNull(),
});

export const groupRelations = relations(group, ({ one, many }) => ({
    stage: one(stage, {
        fields: [group.stageId],
        references: [stage.id],
    }),
    rounds: many(round),
    matches: many(match),
}));

export type Group = typeof group.$inferSelect;
export type NewGroup = typeof group.$inferInsert;

