import { OmitId } from 'brackets-manager';
import { MatchStatusTransformer, ParticipantMatchResultTransformer } from '..';
import type {
    MatchWithExtra,
    MatchExtrasInput,
    JsonValue,
    JsonObject,
} from '../../types';
import type {
    Match as DrizzleMatch,
    ParticipantMatchResult,
} from '../../db/schema';

type DrizzleMatchWithRelations = DrizzleMatch & {
    opponent1Result: ParticipantMatchResult | null;
    opponent2Result: ParticipantMatchResult | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getMatchExtras(input: MatchExtrasInput): JsonObject {
    const clone = { ...input } as Record<string, unknown>;

    delete clone.id;
    delete clone.status;
    delete clone.stage_id;
    delete clone.group_id;
    delete clone.round_id;
    delete clone.number;
    delete clone.child_count;
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

function normalizeMatchExtras(extra: unknown): Record<string, unknown> {
    if (!isRecord(extra)) {
        return {};
    }

    return extra;
}

function hasOwnExtraProperty(input: MatchExtrasInput): boolean {
    return Object.prototype.hasOwnProperty.call(input, 'extra');
}

export function matchExtraFromInput(
    input: MatchExtrasInput,
    previousExtra?: JsonValue | null,
): JsonValue | null | undefined {
    const customFields = getMatchExtras(input);
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

export const MatchTransformer = {
    to(input: Omit<OmitId<MatchWithExtra>, 'opponent1' | 'opponent2'>) {
        const extrasInput = input as unknown as MatchExtrasInput;
        const extra = matchExtraFromInput(extrasInput);

        return {
            status: MatchStatusTransformer.to(input.status),
            stageId: String(input.stage_id),
            groupId: String(input.group_id),
            roundId: String(input.round_id),
            number: input.number,
            childCount: input.child_count,
            extra: extra ?? null,
        };
    },
    from(output: DrizzleMatchWithRelations): MatchWithExtra {
        const normalizedExtras = normalizeMatchExtras(output.extra);

        return {
            id: output.id,
            status: MatchStatusTransformer.from(output.status),
            stage_id: output.stageId,
            group_id: output.groupId,
            round_id: output.roundId,
            number: output.number,
            child_count: output.childCount,
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
