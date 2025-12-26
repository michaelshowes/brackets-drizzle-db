import { DataTypes } from 'brackets-manager/dist/types';
import { StageTypeTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { stage, stageSettings } from '../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function handleStageDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['stage']>,
): Promise<boolean> {
    try {
        if (!filter) {
            // No filter: delete in the right order to satisfy FK constraints
            await db.delete(stageSettings);
            await db.delete(stage);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(stage.id, String(filter.id)));
        if (filter.name !== undefined) conditions.push(eq(stage.name, filter.name));
        if (filter.number !== undefined)
            conditions.push(eq(stage.number, filter.number));
        if (filter.tournament_id !== undefined)
            conditions.push(eq(stage.tournamentId, String(filter.tournament_id)));
        if (filter.type !== undefined)
            conditions.push(eq(stage.type, StageTypeTransformer.to(filter.type)));

        // Find matching stages
        const stages = await db
            .select({ id: stage.id })
            .from(stage)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        if (stages.length === 0) return true;

        const stageIds = stages.map((s) => s.id);

        // Delete related StageSettings first to satisfy FK constraints
        await db
            .delete(stageSettings)
            .where(inArray(stageSettings.stageId, stageIds));

        // Then delete the stages
        await db.delete(stage).where(inArray(stage.id, stageIds));

        return true;
    } catch (e) {
        console.error(
            new Error(`Error deleting stages with filter ${JSON.stringify(filter)}`, {
                cause: e,
            }),
        );
        return false;
    }
}
