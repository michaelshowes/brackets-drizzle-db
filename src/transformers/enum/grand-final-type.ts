import { GrandFinalType } from 'brackets-model';
import type { GrandFinalType as DrizzleGrandFinalType } from '../../db/schema/enums';

export const GrandFinalTypeTransformer = {
    to(type: GrandFinalType): DrizzleGrandFinalType {
        switch (type) {
            case 'none':
                return 'NONE';
            case 'simple':
                return 'SIMPLE';
            case 'double':
                return 'DOUBLE';
        }
    },
    from(type: DrizzleGrandFinalType): GrandFinalType {
        switch (type) {
            case 'NONE':
                return 'none';
            case 'SIMPLE':
                return 'simple';
            case 'DOUBLE':
                return 'double';
        }
    },
};
