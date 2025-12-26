import { DataTypes } from 'brackets-manager/dist/types';
import { GroupTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { group } from '../../db/schema';

// Group insert requires an id to be provided since we're using text IDs
type GroupInsertInput = DataTypes['group'];

export async function handleGroupInsert(
    db: DrizzleDatabase,
    values: GroupInsertInput | GroupInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            await db.insert(group).values(
                values.map((g) => ({ id: String(g.id), ...GroupTransformer.to(g) })),
            );
            return true;
        }

        const result = await db
            .insert(group)
            .values({ id: String(values.id), ...GroupTransformer.to(values) })
            .returning({ id: group.id });

        return result[0]?.id ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}
