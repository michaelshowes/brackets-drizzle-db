import { DataTypes } from 'brackets-manager/dist/types';
import {
    handleGroupDelete,
    handleMatchDelete,
    handleMatchGameDelete,
    handleParticipantDelete,
    handleRoundDelete,
    handleStageDelete,
    handleTournamentDelete,
} from './delete-handlers';
import type { DrizzleDatabase } from '../db';
import type { Tournament } from '../transformers';

export async function handleDelete<T extends keyof DataTypes>(
    db: DrizzleDatabase,
    table: T | 'tournament',
    filter?: Partial<DataTypes[T]>,
): Promise<boolean> {
    switch (table) {
        case 'tournament':
            return handleTournamentDelete(db, filter as Partial<Tournament> | undefined);

        case 'participant':
            return handleParticipantDelete(db, filter);

        case 'stage':
            return handleStageDelete(db, filter);

        case 'group':
            return handleGroupDelete(db, filter);

        case 'round':
            return handleRoundDelete(db, filter);

        case 'match':
            return handleMatchDelete(db, filter);

        case 'match_game':
            return handleMatchGameDelete(db, filter);

        default:
            return false;
    }
}
