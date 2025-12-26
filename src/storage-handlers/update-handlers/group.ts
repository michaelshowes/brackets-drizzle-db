import { DataTypes } from 'brackets-manager/dist/types';
import type { DrizzleDatabase } from '../../db';
import { group } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleGroupUpdate(
    db: DrizzleDatabase,
    filter: Partial<DataTypes['group']> | number | string,
    value: Partial<DataTypes['group']> | DataTypes['group'],
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = {};
        if (value.number !== undefined) updateData.number = value.number;
        if (value.stage_id !== undefined) updateData.stageId = String(value.stage_id);

        if (typeof filter === 'number' || typeof filter === 'string') {
            await db.update(group).set(updateData).where(eq(group.id, String(filter)));
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(group.id, String(filter.id)));
        if (filter.number !== undefined)
            conditions.push(eq(group.number, filter.number));
        if (filter.stage_id !== undefined)
            conditions.push(eq(group.stageId, String(filter.stage_id)));

        await db
            .update(group)
            .set(updateData)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
