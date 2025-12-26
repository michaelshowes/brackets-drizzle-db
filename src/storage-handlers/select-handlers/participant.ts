import { DataTypes } from 'brackets-manager/dist/types';
import { ParticipantTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { participant } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleParticipantSelect(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['participant']> | number | string,
): Promise<DataTypes['participant'][] | DataTypes['participant'] | null> {
    try {
        if (filter === undefined) {
            const values = await db.select().from(participant);
            return values.map(ParticipantTransformer.from);
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(participant)
                .where(eq(participant.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            return ParticipantTransformer.from(values[0]);
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(participant.id, String(filter.id)));
        if (filter.name !== undefined) conditions.push(eq(participant.name, filter.name));
        if (filter.tournament_id !== undefined)
            conditions.push(eq(participant.tournamentId, String(filter.tournament_id)));

        const values = await db
            .select()
            .from(participant)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return values.map(ParticipantTransformer.from);
    } catch {
        return [];
    }
}
