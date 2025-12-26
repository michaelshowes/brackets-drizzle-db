import {
    MatchGameTransformer,
    MatchResultTransformer,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { matchGame, participantMatchGameResult } from '../../db/schema';
import type { MatchGameWithExtra } from '../../types';
import { randomUUID } from 'crypto';

// MatchGame insert requires an id to be provided since we're using text IDs
type MatchGameInsertInput = MatchGameWithExtra;

export async function handleMatchGameInsert(
    db: DrizzleDatabase,
    values: MatchGameInsertInput | MatchGameInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            for (const value of values) {
                await insertSingleMatchGame(db, value);
            }
            return true;
        }

        const result = await insertSingleMatchGame(db, values);
        return result ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}

async function insertSingleMatchGame(
    db: DrizzleDatabase,
    value: MatchGameInsertInput,
): Promise<string> {
    const matchGameData = MatchGameTransformer.to(value);
    const matchGameId = String(value.id);

    const matchGameResult = await db
        .insert(matchGame)
        .values({
            id: matchGameId,
            ...matchGameData,
            extra: value.extra ?? null,
        })
        .returning({ id: matchGame.id });

    const insertedMatchGameId = matchGameResult[0]?.id;

    if (!insertedMatchGameId) {
        throw new Error('Failed to insert match game');
    }

    // Insert opponent1 result if provided
    if (value.opponent1) {
        await db.insert(participantMatchGameResult).values({
            id: randomUUID(),
            participantId: value.opponent1.id != null ? String(value.opponent1.id) : null,
            forfeit: value.opponent1.forfeit ?? null,
            position: value.opponent1.position ?? null,
            score: value.opponent1.score ?? null,
            result: value.opponent1.result
                ? MatchResultTransformer.to(value.opponent1.result)
                : null,
            opponent1MatchGameId: insertedMatchGameId,
        });
    }

    // Insert opponent2 result if provided
    if (value.opponent2) {
        await db.insert(participantMatchGameResult).values({
            id: randomUUID(),
            participantId: value.opponent2.id != null ? String(value.opponent2.id) : null,
            forfeit: value.opponent2.forfeit ?? null,
            position: value.opponent2.position ?? null,
            score: value.opponent2.score ?? null,
            result: value.opponent2.result
                ? MatchResultTransformer.to(value.opponent2.result)
                : null,
            opponent2MatchGameId: insertedMatchGameId,
        });
    }

    return insertedMatchGameId;
}
