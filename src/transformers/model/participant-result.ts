import { ParticipantResult } from 'brackets-model';
import { MatchResultTransformer } from '..';
import type {
    ParticipantMatchResult,
    ParticipantMatchGameResult,
} from '../../db/schema';

type DrizzleParticipantResult =
    | ParticipantMatchResult
    | ParticipantMatchGameResult;

// Input type that accepts the broader Id type from brackets-model
type ParticipantResultInput = {
    id?: number | string | null;
    forfeit?: boolean;
    position?: number;
    score?: number;
    result?: 'win' | 'draw' | 'loss';
};

export const ParticipantMatchResultTransformer = {
    to(input: ParticipantResultInput) {
        return {
            participantId: input.id != null ? String(input.id) : null,
            forfeit: input.forfeit ?? null,
            position: input.position ?? null,
            score: input.score ?? null,
            result: input.result ? MatchResultTransformer.to(input.result) : null,
        };
    },
    from(output: DrizzleParticipantResult): ParticipantResult {
        return {
            id: output.participantId ?? null,
            forfeit: output.forfeit ?? undefined,
            position: output.position ?? undefined,
            score: output.score ?? undefined,
            result: output.result
                ? MatchResultTransformer.from(output.result)
                : undefined,
        };
    },
};
