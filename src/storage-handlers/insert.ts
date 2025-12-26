import { DataTypes } from 'brackets-manager/dist/types';
import {
    handleGroupInsert,
    handleParticipantInsert,
    handleStageInsert,
    handleRoundInsert,
    handleMatchGameInsert,
    handleMatchInsert,
    handleTournamentInsert,
} from './insert-handlers';
import type { DrizzleDatabase } from '../db';
import type { Tournament } from '../transformers';
import type { MatchWithExtra, MatchGameWithExtra } from '../types';

// With text IDs, we expect the caller to provide the id in the values
export async function handleInsert<T extends keyof DataTypes>(
    db: DrizzleDatabase,
    table: T | 'tournament',
    values: DataTypes[T] | DataTypes[T][],
): Promise<string | number | boolean> {
    switch (table) {
        case 'tournament':
            return handleTournamentInsert(
                db,
                values as unknown as Tournament | Tournament[],
            );

        case 'participant':
            return handleParticipantInsert(
                db,
                values as unknown as DataTypes['participant'] | DataTypes['participant'][],
            );

        case 'stage':
            return handleStageInsert(
                db,
                values as unknown as DataTypes['stage'] | DataTypes['stage'][],
            );

        case 'group':
            return handleGroupInsert(
                db,
                values as unknown as DataTypes['group'] | DataTypes['group'][],
            );

        case 'round':
            return handleRoundInsert(
                db,
                values as unknown as DataTypes['round'] | DataTypes['round'][],
            );

        case 'match':
            return handleMatchInsert(
                db,
                values as unknown as MatchWithExtra | MatchWithExtra[],
            );

        case 'match_game':
            return handleMatchGameInsert(
                db,
                values as unknown as MatchGameWithExtra | MatchGameWithExtra[],
            );

        default:
            return false;
    }
}
