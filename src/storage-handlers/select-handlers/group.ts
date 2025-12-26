import { DataTypes } from 'brackets-manager/dist/types';
import { GroupTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { group } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function handleGroupSelect(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['group']> | number | string,
): Promise<DataTypes['group'][] | DataTypes['group'] | null> {
    try {
        if (filter === undefined) {
            const values = await db
                .select()
                .from(group)
                .orderBy(asc(group.number));
            return values.map(GroupTransformer.from);
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(group)
                .where(eq(group.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            return GroupTransformer.from(values[0]);
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(group.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(group.stageId, String(filter.stage_id)));
        if (filter.number !== undefined)
            conditions.push(eq(group.number, filter.number));

        const values = await db
            .select()
            .from(group)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(group.number));

        return values.map(GroupTransformer.from);
    } catch {
        return [];
    }
}
