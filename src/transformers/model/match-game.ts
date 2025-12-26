import { OmitId } from 'brackets-manager';
import { MatchStatusTransformer, ParticipantMatchResultTransformer } from '..';
import type {
    MatchGameWithExtra,
    MatchGameExtrasInput,
    JsonValue,
    JsonObject,
} from '../../types';
import type {
    MatchGame as DrizzleMatchGame,
    ParticipantMatchGameResult,
} from '../../db/schema';

type DrizzleMatchGameWithRelations = DrizzleMatchGame & {
    opponent1Result: ParticipantMatchGameResult | null;
    opponent2Result: ParticipantMatchGameResult | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getMatchGameExtras(input: MatchGameExtrasInput): JsonObject {
    const clone = { ...input } as Record<string, unknown>;

    delete clone.id;
    delete clone.status;
    delete clone.stage_id;
    delete clone.parent_id;
    delete clone.number;
    delete clone.opponent1;
    delete clone.opponent2;
    delete clone.extra;

    return Object.entries(clone).reduce<JsonObject>((extras, [key, value]) => {
        if (value !== undefined) {
            extras[key] = value as JsonValue;
        }

        return extras;
    }, {});
}

function normalizeMatchGameExtras(extra: unknown): Record<string, unknown> {
    if (!isRecord(extra)) {
        return {};
    }

    return extra;
}

function hasOwnExtraProperty(input: MatchGameExtrasInput): boolean {
    return Object.prototype.hasOwnProperty.call(input, 'extra');
}

export function matchGameExtraFromInput(
    input: MatchGameExtrasInput,
    previousExtra?: JsonValue | null,
): JsonValue | null | undefined {
    const customFields = getMatchGameExtras(input);
    const hasCustomFields = Object.keys(customFields).length > 0;

    if (hasOwnExtraProperty(input)) {
        const providedExtra = input.extra as JsonValue | null | undefined;

        if (providedExtra === undefined) {
            return hasCustomFields ? customFields : undefined;
        }

        if (isRecord(providedExtra)) {
            const normalized = providedExtra as JsonObject;

            return hasCustomFields
                ? { ...normalized, ...customFields }
                : normalized;
        }

        return providedExtra ?? null;
    }

    if (!hasCustomFields) {
        return undefined;
    }

    if (isRecord(previousExtra)) {
        const normalized = previousExtra as JsonObject;

        return { ...normalized, ...customFields };
    }

    return customFields;
}

export const MatchGameTransformer = {
    to(input: Omit<OmitId<MatchGameWithExtra>, 'opponent1' | 'opponent2'>) {
        const extrasInput = input as unknown as MatchGameExtrasInput;
        const extra = matchGameExtraFromInput(extrasInput);

        return {
            status: MatchStatusTransformer.to(input.status),
            stageId: String(input.stage_id),
            matchId: String(input.parent_id),
            number: input.number,
            extra: extra ?? null,
        };
    },
    from(output: DrizzleMatchGameWithRelations): MatchGameWithExtra {
        const normalizedExtras = normalizeMatchGameExtras(output.extra);

        return {
            id: output.id,
            status: MatchStatusTransformer.from(output.status),
            stage_id: output.stageId,
            parent_id: output.matchId,
            number: output.number,
            ...normalizedExtras,
            extra: (output.extra as JsonValue) ?? undefined,
            opponent1: output.opponent1Result
                ? ParticipantMatchResultTransformer.from(output.opponent1Result)
                : null,
            opponent2: output.opponent2Result
                ? ParticipantMatchResultTransformer.from(output.opponent2Result)
                : null,
        };
    },
};
