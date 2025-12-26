import { DataTypes } from 'brackets-manager/dist/types';
import {
    StageTransformer,
    StageSettingsTransformer,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { stage, stageSettings } from '../../db/schema';
import { randomUUID } from 'crypto';

// Stage insert requires an id to be provided since we're using text IDs
type StageInsertInput = DataTypes['stage'];

export async function handleStageInsert(
    db: DrizzleDatabase,
    values: StageInsertInput | StageInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            // For batch insert, we need to insert stages first, then settings
            for (const v of values) {
                const stageId = String(v.id);
                const stageResult = await db
                    .insert(stage)
                    .values({ id: stageId, ...StageTransformer.to(v) })
                    .returning({ id: stage.id });

                if (stageResult[0] && v.settings) {
                    await db.insert(stageSettings).values({
                        id: randomUUID(),
                        stageId: stageResult[0].id,
                        ...StageSettingsTransformer.to(v.settings),
                    });
                }
            }
            return true;
        }

        const stageId = String(values.id);
        const stageResult = await db
            .insert(stage)
            .values({ id: stageId, ...StageTransformer.to(values) })
            .returning({ id: stage.id });

        if (stageResult[0] && values.settings) {
            await db.insert(stageSettings).values({
                id: randomUUID(),
                stageId: stageResult[0].id,
                ...StageSettingsTransformer.to(values.settings),
            });
        }

        return stageResult[0]?.id ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}
