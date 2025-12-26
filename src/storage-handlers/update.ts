import { DataTypes } from 'brackets-manager/dist/types';
import {
    handleGroupUpdate,
    handleMatchGameUpdate,
    handleMatchUpdate,
    handleParticipantUpdate,
    handleRoundUpdate,
    handleStageUpdate,
    handleTournamentUpdate,
} from './update-handlers';
import type { DrizzleDatabase } from '../db';
import type { Tournament } from '../transformers';

export async function handleUpdate<T extends keyof DataTypes>(
    db: DrizzleDatabase,
    table: T | 'tournament',
    filter: Partial<DataTypes[T]> | number,
    value: Partial<DataTypes[T]> | DataTypes[T],
): Promise<boolean> {
    switch (table) {
        case 'tournament':
            return handleTournamentUpdate(
                db,
                filter as number | Partial<Tournament>,
                value as Partial<Tournament>,
            );

        case 'participant':
            return handleParticipantUpdate(db, filter, value);

        case 'stage':
            return handleStageUpdate(db, filter, value);

        case 'group':
            return handleGroupUpdate(db, filter, value);

        case 'round':
            return handleRoundUpdate(db, filter, value);

        case 'match':
            return handleMatchUpdate(db, filter, value);

        case 'match_game':
            return handleMatchGameUpdate(db, filter, value);

        default:
            return false;
    }
}
