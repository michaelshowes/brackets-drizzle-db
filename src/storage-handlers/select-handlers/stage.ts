import { DataTypes } from 'brackets-manager/dist/types';
import { StageTransformer, StageTypeTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { stage, stageSettings } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function handleStageSelect(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['stage']> | number | string,
): Promise<DataTypes['stage'][] | DataTypes['stage'] | null> {
    try {
        if (filter === undefined) {
            const values = await db
                .select()
                .from(stage)
                .leftJoin(stageSettings, eq(stage.id, stageSettings.stageId))
                .orderBy(asc(stage.number));

            return values.map((row) =>
                StageTransformer.from({
                    ...row.Stage,
                    settings: row.StageSettings,
                }),
            );
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(stage)
                .leftJoin(stageSettings, eq(stage.id, stageSettings.stageId))
                .where(eq(stage.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            return StageTransformer.from({
                ...values[0].Stage,
                settings: values[0].StageSettings,
            });
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(stage.id, String(filter.id)));
        if (filter.name !== undefined) conditions.push(eq(stage.name, filter.name));
        if (filter.tournament_id !== undefined)
            conditions.push(eq(stage.tournamentId, String(filter.tournament_id)));
        if (filter.number !== undefined)
            conditions.push(eq(stage.number, filter.number));
        if (filter.type !== undefined)
            conditions.push(eq(stage.type, StageTypeTransformer.to(filter.type)));

        const values = await db
            .select()
            .from(stage)
            .leftJoin(stageSettings, eq(stage.id, stageSettings.stageId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(stage.number));

        return values.map((row) =>
            StageTransformer.from({
                ...row.Stage,
                settings: row.StageSettings,
            }),
        );
    } catch {
        return [];
    }
}
