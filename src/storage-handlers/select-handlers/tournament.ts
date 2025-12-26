import { TournamentTransformer, Tournament } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { tournament } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleTournamentSelect(
    db: DrizzleDatabase,
    filter?: Partial<Tournament> | number | string,
): Promise<Tournament[] | Tournament | null> {
    try {
        if (filter === undefined) {
            const values = await db.select().from(tournament);
            return values.map(TournamentTransformer.from);
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(tournament)
                .where(eq(tournament.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            return TournamentTransformer.from(values[0]);
        }

        const conditions = [];
        if (filter.id !== undefined)
            conditions.push(eq(tournament.id, String(filter.id)));
        if (filter.name !== undefined)
            conditions.push(eq(tournament.name, filter.name));

        const values = await db
            .select()
            .from(tournament)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return values.map(TournamentTransformer.from);
    } catch {
        return [];
    }
}

