import { Group } from 'brackets-model';
import { OmitId } from 'brackets-manager';
import type { Group as DrizzleGroup } from '../../db/schema';

// Generic input type that accepts Id (string | number)
type GroupInput = {
    stage_id: number | string;
    number: number;
};

export const GroupTransformer = {
    to(input: OmitId<Group> | GroupInput) {
        return {
            stageId: String(input.stage_id),
            number: input.number,
        };
    },
    from(output: DrizzleGroup): Group {
        return {
            id: output.id,
            stage_id: output.stageId,
            number: output.number,
        };
    },
};
