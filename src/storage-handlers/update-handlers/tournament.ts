import { Tournament } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { tournament } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { JsonValue } from '../../types';

export async function handleTournamentUpdate(
    db: DrizzleDatabase,
    filter: Partial<Tournament> | number | string,
    value: Partial<Tournament>,
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = {};
        if (value.name !== undefined) updateData.name = value.name;
        if (value.description !== undefined)
            updateData.description = value.description;
        if (value.start_date !== undefined)
            updateData.startDate = value.start_date;
        if (value.end_date !== undefined) updateData.endDate = value.end_date;
        if (value.extra !== undefined)
            updateData.extra = value.extra as JsonValue;

        if (typeof filter === 'number' || typeof filter === 'string') {
            await db
                .update(tournament)
                .set(updateData)
                .where(eq(tournament.id, String(filter)));
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined)
            conditions.push(eq(tournament.id, String(filter.id)));
        if (filter.name !== undefined)
            conditions.push(eq(tournament.name, filter.name));

        await db
            .update(tournament)
            .set(updateData)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}

