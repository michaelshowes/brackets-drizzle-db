import { Tournament } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { tournament } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleTournamentDelete(
    db: DrizzleDatabase,
    filter?: Partial<Tournament>,
): Promise<boolean> {
    try {
        if (!filter) {
            await db.delete(tournament);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined)
            conditions.push(eq(tournament.id, String(filter.id)));
        if (filter.name !== undefined)
            conditions.push(eq(tournament.name, filter.name));

        await db
            .delete(tournament)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}

