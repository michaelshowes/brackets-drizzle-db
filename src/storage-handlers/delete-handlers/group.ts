import { DataTypes } from 'brackets-manager/dist/types';
import type { DrizzleDatabase } from '../../db';
import { group } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function handleGroupDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['group']>,
): Promise<boolean> {
    try {
        if (!filter) {
            await db.delete(group);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(group.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(group.stageId, String(filter.stage_id)));
        if (filter.number !== undefined)
            conditions.push(eq(group.number, filter.number));

        await db
            .delete(group)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return true;
    } catch {
        return false;
    }
}
