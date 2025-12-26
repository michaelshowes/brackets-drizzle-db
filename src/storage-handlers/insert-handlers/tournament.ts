import { TournamentTransformer, Tournament } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { tournament } from '../../db/schema';

// Tournament insert requires an id to be provided since we're using text IDs
type TournamentInsertInput = Tournament;

export async function handleTournamentInsert(
    db: DrizzleDatabase,
    values: TournamentInsertInput | TournamentInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            await db.insert(tournament).values(
                values.map((t) => {
                    const value = TournamentTransformer.to(t);
                    return { id: String(t.id), ...value, extra: value.extra ?? undefined };
                }),
            );
            return true;
        }

        const value = TournamentTransformer.to(values);
        const result = await db
            .insert(tournament)
            .values({ id: String(values.id), ...value, extra: value.extra ?? undefined })
            .returning({ id: tournament.id });

        return result[0]?.id ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}

