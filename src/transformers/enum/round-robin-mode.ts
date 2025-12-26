import { RoundRobinMode } from 'brackets-model';
import type { RoundRobinMode as DrizzleRoundRobinMode } from '../../db/schema/enums';

export const RoundRobinModeTransformer = {
    to(mode: RoundRobinMode): DrizzleRoundRobinMode {
        switch (mode) {
            case 'simple':
                return 'SIMPLE';
            case 'double':
                return 'DOUBLE';
        }
    },
    from(mode: DrizzleRoundRobinMode): RoundRobinMode {
        switch (mode) {
            case 'SIMPLE':
                return 'simple';
            case 'DOUBLE':
                return 'double';
        }
    },
};
