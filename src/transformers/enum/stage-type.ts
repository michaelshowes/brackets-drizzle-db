import { StageType } from 'brackets-model';
import type { StageType as DrizzleStageType } from '../../db/schema/enums';

export const StageTypeTransformer = {
    to(type: StageType): DrizzleStageType {
        switch (type) {
            case 'round_robin':
                return 'ROUND_ROBIN';
            case 'single_elimination':
                return 'SINGLE_ELIMINATION';
            case 'double_elimination':
                return 'DOUBLE_ELIMINATION';
        }
    },
    from(type: DrizzleStageType): StageType {
        switch (type) {
            case 'ROUND_ROBIN':
                return 'round_robin';
            case 'SINGLE_ELIMINATION':
                return 'single_elimination';
            case 'DOUBLE_ELIMINATION':
                return 'double_elimination';
        }
    },
};
