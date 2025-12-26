import { Result } from 'brackets-model';
import type { MatchResult as DrizzleMatchResult } from '../../db/schema/enums';

export const MatchResultTransformer = {
    to(result: Result): DrizzleMatchResult {
        switch (result) {
            case 'win':
                return 'WIN';
            case 'draw':
                return 'DRAW';
            case 'loss':
                return 'LOSS';
        }
    },
    from(result: DrizzleMatchResult): Result {
        switch (result) {
            case 'WIN':
                return 'win';
            case 'DRAW':
                return 'draw';
            case 'LOSS':
                return 'loss';
        }
    },
};
