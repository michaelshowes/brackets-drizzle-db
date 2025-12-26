import { MatchTransformer, MatchResultTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { match, participantMatchResult } from '../../db/schema';
import type { MatchWithExtra } from '../../types';
import { randomUUID } from 'crypto';

// Match insert requires an id to be provided since we're using text IDs
type MatchInsertInput = MatchWithExtra;

export async function handleMatchInsert(
    db: DrizzleDatabase,
    values: MatchInsertInput | MatchInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            for (const value of values) {
                await insertSingleMatch(db, value);
            }
            return true;
        }

        const result = await insertSingleMatch(db, values);
        return result ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}

async function insertSingleMatch(
    db: DrizzleDatabase,
    value: MatchInsertInput,
): Promise<string> {
    const matchData = MatchTransformer.to(value);
    const matchId = String(value.id);

    const matchResult = await db
        .insert(match)
        .values({
            id: matchId,
            ...matchData,
            extra: value.extra ?? null,
        })
        .returning({ id: match.id });

    const insertedMatchId = matchResult[0]?.id;

    if (!insertedMatchId) {
        throw new Error('Failed to insert match');
    }

    // Insert opponent1 result if provided
    if (value.opponent1) {
        await db.insert(participantMatchResult).values({
            id: randomUUID(),
            participantId: value.opponent1.id != null ? String(value.opponent1.id) : null,
            forfeit: value.opponent1.forfeit ?? null,
            position: value.opponent1.position ?? null,
            score: value.opponent1.score ?? null,
            result: value.opponent1.result
                ? MatchResultTransformer.to(value.opponent1.result)
                : null,
            opponent1MatchId: insertedMatchId,
        });
    }

    // Insert opponent2 result if provided
    if (value.opponent2) {
        await db.insert(participantMatchResult).values({
            id: randomUUID(),
            participantId: value.opponent2.id != null ? String(value.opponent2.id) : null,
            forfeit: value.opponent2.forfeit ?? null,
            position: value.opponent2.position ?? null,
            score: value.opponent2.score ?? null,
            result: value.opponent2.result
                ? MatchResultTransformer.to(value.opponent2.result)
                : null,
            opponent2MatchId: insertedMatchId,
        });
    }

    return insertedMatchId;
}
