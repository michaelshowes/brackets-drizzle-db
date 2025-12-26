import { DataTypes } from 'brackets-manager/dist/types';
import {
    handleGroupSelect,
    handleMatchGameSelect,
    handleMatchSelect,
    handleParticipantSelect,
    handleRoundSelect,
    handleStageSelect,
    handleTournamentSelect,
} from './select-handlers';
import type { DrizzleDatabase } from '../db';

export async function handleSelect<T extends keyof DataTypes>(
    db: DrizzleDatabase,
    table: T | 'tournament',
    filter?: Partial<DataTypes[T]> | number | string,
): Promise<DataTypes[T][] | DataTypes[T] | null> {
    switch (table) {
        case 'tournament':
            return handleTournamentSelect(db, filter as number | string | undefined) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'participant':
            return handleParticipantSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'stage':
            return handleStageSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'group':
            return handleGroupSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'round':
            return handleRoundSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'match':
            return handleMatchSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        case 'match_game':
            return handleMatchGameSelect(db, filter) as unknown as
                | DataTypes[T][]
                | DataTypes[T]
                | null;

        default:
            return null;
    }
}
