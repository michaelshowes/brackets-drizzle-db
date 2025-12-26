import { DataTypes } from 'brackets-manager/dist/types';
import type { DrizzleDatabase } from '../../db';
import { participant } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleParticipantDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['participant']>,
): Promise<boolean> {
    try {
        if (!filter) {
            await db.delete(participant);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(participant.id, String(filter.id)));
        if (filter.name !== undefined)
            conditions.push(eq(participant.name, filter.name));
        if (filter.tournament_id !== undefined)
            conditions.push(eq(participant.tournamentId, String(filter.tournament_id)));

        await db
            .delete(participant)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
