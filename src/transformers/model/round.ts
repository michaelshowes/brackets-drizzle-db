import { Round } from 'brackets-model';
import { OmitId } from 'brackets-manager';
import type { Round as DrizzleRound } from '../../db/schema';

// Generic input type that accepts Id (string | number)
type RoundInput = {
    stage_id: number | string;
    group_id: number | string;
    number: number;
};

export const RoundTransformer = {
    to(input: OmitId<Round> | RoundInput) {
        return {
            stageId: String(input.stage_id),
            groupId: String(input.group_id),
            number: input.number,
        };
    },
    from(output: DrizzleRound): Round {
        return {
            id: output.id,
            stage_id: output.stageId,
            group_id: output.groupId,
            number: output.number,
        };
    },
};
