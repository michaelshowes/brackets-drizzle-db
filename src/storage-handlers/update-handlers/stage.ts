import { DataTypes } from 'brackets-manager/dist/types';
import {
    GrandFinalTypeTransformer,
    RoundRobinModeTransformer,
    SeedOrderingTransformer,
    StageTypeTransformer,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { stage, stageSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function handleStageUpdate(
    db: DrizzleDatabase,
    filter: Partial<DataTypes['stage']> | number | string,
    value: Partial<DataTypes['stage']> | DataTypes['stage'],
): Promise<boolean> {
    if (typeof filter !== 'number' && typeof filter !== 'string') {
        return false;
    }

    const filterId = String(filter);

    try {
        // Update stage
        const stageData: Record<string, unknown> = {};
        if (value.name !== undefined) stageData.name = value.name;
        if (value.number !== undefined) stageData.number = value.number;
        if (value.tournament_id !== undefined)
            stageData.tournamentId = String(value.tournament_id);
        if (value.type !== undefined)
            stageData.type = StageTypeTransformer.to(value.type);

        if (Object.keys(stageData).length > 0) {
            await db.update(stage).set(stageData).where(eq(stage.id, filterId));
        }

        // Update settings if provided
        if (value.settings) {
            const settingsData: Record<string, unknown> = {};
            if (value.settings.size !== undefined)
                settingsData.size = value.settings.size;
            if (value.settings.seedOrdering !== undefined)
                settingsData.seedOrdering = value.settings.seedOrdering.map(
                    SeedOrderingTransformer.to,
                );
            if (value.settings.balanceByes !== undefined)
                settingsData.balanceByes = value.settings.balanceByes;
            if (value.settings.matchesChildCount !== undefined)
                settingsData.matchesChildCount = value.settings.matchesChildCount;
            if (value.settings.groupCount !== undefined)
                settingsData.groupCount = value.settings.groupCount;
            if (value.settings.roundRobinMode !== undefined)
                settingsData.roundRobinMode = RoundRobinModeTransformer.to(
                    value.settings.roundRobinMode,
                );
            if (value.settings.manualOrdering !== undefined)
                settingsData.manualOrdering = value.settings.manualOrdering;
            if (value.settings.consolationFinal !== undefined)
                settingsData.consolationFinal = value.settings.consolationFinal;
            if (value.settings.skipFirstRound !== undefined)
                settingsData.skipFirstRound = value.settings.skipFirstRound;
            if (value.settings.grandFinal !== undefined)
                settingsData.grandFinal = GrandFinalTypeTransformer.to(
                    value.settings.grandFinal,
                );

            if (Object.keys(settingsData).length > 0) {
                await db
                    .update(stageSettings)
                    .set(settingsData)
                    .where(eq(stageSettings.stageId, filterId));
            }
        }

        return true;
    } catch {
        return false;
    }
}
