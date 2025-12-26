import { DataTypes } from 'brackets-manager/dist/types';
import { participantExtraFromInput } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { participant } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleParticipantUpdate(
    db: DrizzleDatabase,
    filter: Partial<DataTypes['participant']> | number | string,
    value: Partial<DataTypes['participant']> | DataTypes['participant'],
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = {};
        if (value.name !== undefined) updateData.name = value.name;
        if (value.tournament_id !== undefined)
            updateData.tournamentId = String(value.tournament_id);

        const extra = participantExtraFromInput(value as Record<string, unknown>);
        if (extra !== null) updateData.extra = extra;

        if (typeof filter === 'number' || typeof filter === 'string') {
            await db
                .update(participant)
                .set(updateData)
                .where(eq(participant.id, String(filter)));
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(participant.id, String(filter.id)));
        if (filter.name !== undefined)
            conditions.push(eq(participant.name, filter.name));
        if (filter.tournament_id !== undefined)
            conditions.push(eq(participant.tournamentId, String(filter.tournament_id)));

        await db
            .update(participant)
            .set(updateData)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
