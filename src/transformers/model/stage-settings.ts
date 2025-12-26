import { StageSettings } from 'brackets-model';
import { OmitId } from 'brackets-manager';
import {
    GrandFinalTypeTransformer,
    RoundRobinModeTransformer,
    SeedOrderingTransformer,
} from '..';
import type { StageSettings as DrizzleStageSettings } from '../../db/schema';

export const StageSettingsTransformer = {
    to(input: OmitId<StageSettings>) {
        return {
            size: input.size ?? null,
            seedOrdering: input.seedOrdering
                ? input.seedOrdering.map(SeedOrderingTransformer.to)
                : [],
            balanceByes: input.balanceByes ?? null,
            matchesChildCount: input.matchesChildCount ?? null,
            groupCount: input.groupCount ?? null,
            roundRobinMode: input.roundRobinMode
                ? RoundRobinModeTransformer.to(input.roundRobinMode)
                : null,
            manualOrdering: input.manualOrdering ?? null,
            consolationFinal: input.consolationFinal ?? null,
            skipFirstRound: input.skipFirstRound ?? null,
            grandFinal: input.grandFinal
                ? GrandFinalTypeTransformer.to(input.grandFinal)
                : null,
        };
    },
    from(output: Omit<DrizzleStageSettings, 'stageId'>): StageSettings {
        return {
            size: output.size ?? undefined,
            seedOrdering: output.seedOrdering
                ? output.seedOrdering.map(SeedOrderingTransformer.from)
                : [],
            balanceByes: output.balanceByes ?? undefined,
            matchesChildCount: output.matchesChildCount ?? undefined,
            groupCount: output.groupCount ?? undefined,
            roundRobinMode: output.roundRobinMode
                ? RoundRobinModeTransformer.from(output.roundRobinMode)
                : undefined,
            manualOrdering: output.manualOrdering as number[][] | undefined,
            consolationFinal: output.consolationFinal ?? undefined,
            skipFirstRound: output.skipFirstRound ?? undefined,
            grandFinal: output.grandFinal
                ? GrandFinalTypeTransformer.from(output.grandFinal)
                : undefined,
        };
    },
};
