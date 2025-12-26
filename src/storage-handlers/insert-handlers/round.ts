import { DataTypes } from 'brackets-manager/dist/types';
import { RoundTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { round } from '../../db/schema';

// Round insert requires an id to be provided since we're using text IDs
type RoundInsertInput = DataTypes['round'];

export async function handleRoundInsert(
    db: DrizzleDatabase,
    values: RoundInsertInput | RoundInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            await db.insert(round).values(
                values.map((r) => ({ id: String(r.id), ...RoundTransformer.to(r) })),
            );
            return true;
        }

        const result = await db
            .insert(round)
            .values({ id: String(values.id), ...RoundTransformer.to(values) })
            .returning({ id: round.id });

        return result[0]?.id ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}
