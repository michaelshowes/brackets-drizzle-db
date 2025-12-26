import { DataTypes } from 'brackets-manager/dist/types';
import { RoundTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { round } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function handleRoundSelect(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['round']> | number | string,
): Promise<DataTypes['round'][] | DataTypes['round'] | null> {
    try {
        if (filter === undefined) {
            const values = await db
                .select()
                .from(round)
                .orderBy(asc(round.number));
            return values.map(RoundTransformer.from);
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(round)
                .where(eq(round.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            return RoundTransformer.from(values[0]);
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(round.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(round.stageId, String(filter.stage_id)));
        if (filter.group_id !== undefined)
            conditions.push(eq(round.groupId, String(filter.group_id)));
        if (filter.number !== undefined)
            conditions.push(eq(round.number, filter.number));

        const values = await db
            .select()
            .from(round)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(round.number));

        return values.map(RoundTransformer.from);
    } catch {
        return [];
    }
}
