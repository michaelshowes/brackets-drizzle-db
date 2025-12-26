import { DataTypes } from 'brackets-manager/dist/types';
import type { DrizzleDatabase } from '../../db';
import { round } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleRoundDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['round']>,
): Promise<boolean> {
    try {
        if (!filter) {
            await db.delete(round);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(round.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(round.stageId, String(filter.stage_id)));
        if (filter.group_id !== undefined)
            conditions.push(eq(round.groupId, String(filter.group_id)));
        if (filter.number !== undefined)
            conditions.push(eq(round.number, filter.number));

        await db
            .delete(round)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
