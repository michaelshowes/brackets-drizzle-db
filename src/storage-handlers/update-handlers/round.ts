import { DataTypes } from 'brackets-manager/dist/types';
import type { DrizzleDatabase } from '../../db';
import { round } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleRoundUpdate(
    db: DrizzleDatabase,
    filter: Partial<DataTypes['round']> | number | string,
    value: Partial<DataTypes['round']> | DataTypes['round'],
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = {};
        if (value.number !== undefined) updateData.number = value.number;
        if (value.stage_id !== undefined) updateData.stageId = String(value.stage_id);
        if (value.group_id !== undefined) updateData.groupId = String(value.group_id);

        if (typeof filter === 'number' || typeof filter === 'string') {
            await db.update(round).set(updateData).where(eq(round.id, String(filter)));
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(round.id, String(filter.id)));
        if (filter.number !== undefined)
            conditions.push(eq(round.number, filter.number));
        if (filter.stage_id !== undefined)
            conditions.push(eq(round.stageId, String(filter.stage_id)));
        if (filter.group_id !== undefined)
            conditions.push(eq(round.groupId, String(filter.group_id)));

        await db
            .update(round)
            .set(updateData)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
