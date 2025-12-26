import { SeedOrdering } from 'brackets-model';
import type { SeedOrdering as DrizzleSeedOrdering } from '../../db/schema/enums';

export const SeedOrderingTransformer = {
    to(ordering: SeedOrdering): DrizzleSeedOrdering {
        switch (ordering) {
            case 'natural':
                return 'NATURAL';
            case 'reverse':
                return 'REVERSE';
            case 'half_shift':
                return 'HALF_SHIFT';
            case 'reverse_half_shift':
                return 'REVERSE_HALF_SHIFT';
            case 'pair_flip':
                return 'PAIR_FLIP';
            case 'inner_outer':
                return 'INNER_OUTER';
            case 'groups.effort_balanced':
                return 'GROUPS_EFFORT_BALANCED';
            case 'groups.seed_optimized':
                return 'GROUPS_SEED_OPTIMIZED';
            case 'groups.bracket_optimized':
                return 'GROUPS_BRACKET_OPTIMIZED';
        }
    },
    from(ordering: DrizzleSeedOrdering): SeedOrdering {
        switch (ordering) {
            case 'NATURAL':
                return 'natural';
            case 'REVERSE':
                return 'reverse';
            case 'HALF_SHIFT':
                return 'half_shift';
            case 'REVERSE_HALF_SHIFT':
                return 'reverse_half_shift';
            case 'PAIR_FLIP':
                return 'pair_flip';
            case 'INNER_OUTER':
                return 'inner_outer';
            case 'GROUPS_EFFORT_BALANCED':
                return 'groups.effort_balanced';
            case 'GROUPS_SEED_OPTIMIZED':
                return 'groups.seed_optimized';
            case 'GROUPS_BRACKET_OPTIMIZED':
                return 'groups.bracket_optimized';
        }
    },
};
