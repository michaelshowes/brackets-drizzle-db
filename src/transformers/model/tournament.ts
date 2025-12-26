import type { Tournament as DrizzleTournament } from '../../db/schema';
import type { JsonValue } from '../../types';

// Tournament type for external API (using snake_case for consistency with brackets-model)
export type Tournament = {
    id: string;
    name: string;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    extra?: Record<string, unknown>;
};

// Input type for creating/updating tournaments
type TournamentInput = {
    name: string;
    description?: string | null;
    start_date?: Date | string | null;
    end_date?: Date | string | null;
    extra?: Record<string, unknown>;
};

function parseDate(value: Date | string | null | undefined): Date | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value;
    return new Date(value);
}

function normalizeExtra(extra: unknown): Record<string, unknown> | undefined {
    if (
        typeof extra === 'object' &&
        extra !== null &&
        !Array.isArray(extra)
    ) {
        return extra as Record<string, unknown>;
    }
    return undefined;
}

export const TournamentTransformer = {
    to(input: TournamentInput) {
        return {
            name: input.name,
            description: input.description ?? null,
            startDate: parseDate(input.start_date),
            endDate: parseDate(input.end_date),
            extra: input.extra as JsonValue ?? null,
        };
    },
    from(output: DrizzleTournament): Tournament {
        return {
            id: output.id,
            name: output.name,
            description: output.description,
            start_date: output.startDate,
            end_date: output.endDate,
            extra: normalizeExtra(output.extra),
        };
    },
};

