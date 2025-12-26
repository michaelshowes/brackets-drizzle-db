import { Participant } from 'brackets-model';
import { OmitId } from 'brackets-manager';
import type { Participant as DrizzleParticipant } from '../../db/schema';
import type { JsonValue } from '../../types';

function getParticipantExtras(
    input: Record<string, unknown>,
): Record<string, unknown> {
    const clone = { ...input };
    // Delete Participant fields
    delete clone.id;
    delete clone.name;
    delete clone.tournament_id;
    delete clone.extra;
    // Return Extras
    return clone;
}

function getParticipantExtraValue(
    input: Record<string, unknown>,
): JsonValue | null {
    const extra = getParticipantExtras(input);

    return Object.keys(extra).length > 0 ? (extra as JsonValue) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeParticipantExtras(extra: unknown): Record<string, unknown> {
    if (!isRecord(extra)) {
        return {};
    }

    return extra;
}

export function participantExtraFromInput(
    input: Record<string, unknown>,
): JsonValue | null {
    return getParticipantExtraValue(input);
}

// Generic input type that accepts Id (string | number)
type ParticipantInput = {
    name: string;
    tournament_id: number | string;
    [key: string]: unknown;
};

export const ParticipantTransformer = {
    to(input: OmitId<Participant> | ParticipantInput) {
        return {
            name: input.name,
            tournamentId: String(input.tournament_id),
            extra: getParticipantExtraValue(input as Record<string, unknown>),
        };
    },
    from(output: DrizzleParticipant): Participant {
        return {
            id: output.id,
            name: output.name,
            tournament_id: output.tournamentId,
            ...normalizeParticipantExtras(output.extra),
        };
    },
};
