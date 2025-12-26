import { DataTypes } from 'brackets-manager/dist/types';

// JSON type for Drizzle (replaces Prisma.JsonValue)
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type MatchWithExtra = DataTypes['match'] & { extra?: JsonValue | null };
export type MatchExtrasInput = Partial<MatchWithExtra> & Record<string, unknown>;

export type MatchGameWithExtra = DataTypes['match_game'] & { extra?: JsonValue | null };
export type MatchGameExtrasInput = Partial<MatchGameWithExtra> & Record<string, unknown>;
