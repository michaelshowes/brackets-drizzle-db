import { Stage, StageType } from 'brackets-model';
import { OmitId } from 'brackets-manager';
import { StageSettingsTransformer, StageTypeTransformer } from '..';
import type {
    Stage as DrizzleStage,
    StageSettings as DrizzleStageSettings,
} from '../../db/schema';

type DrizzleStageWithSettings = DrizzleStage & {
    settings: DrizzleStageSettings | null;
};

// Generic input type that accepts Id (string | number)
type StageInput = {
    name: string;
    tournament_id: number | string;
    number: number;
    type: StageType;
};

export const StageTransformer = {
    to(input: Omit<OmitId<Stage>, 'settings'> | StageInput) {
        return {
            name: input.name,
            tournamentId: String(input.tournament_id),
            number: input.number,
            type: StageTypeTransformer.to(input.type),
        };
    },
    from(output: DrizzleStageWithSettings): Stage {
        return {
            id: output.id,
            name: output.name,
            tournament_id: output.tournamentId,
            number: output.number,
            type: StageTypeTransformer.from(output.type),
            settings: output.settings
                ? StageSettingsTransformer.from(output.settings)
                : {},
        };
    },
};
