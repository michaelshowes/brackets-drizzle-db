import {
    MatchResultTransformer,
    MatchStatusTransformer,
    matchGameExtraFromInput,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { matchGame, participantMatchGameResult } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type {
    MatchGameWithExtra,
    MatchGameExtrasInput,
    JsonValue,
} from '../../types';
import { randomUUID } from 'crypto';

type ParticipantResultInput = {
    id?: number | string | null;
    forfeit?: boolean;
    position?: number;
    score?: number;
    result?: 'win' | 'draw' | 'loss';
};

async function upsertParticipantResult(
    db: DrizzleDatabase,
    matchGameId: string,
    value: ParticipantResultInput,
    isOpponent1: boolean,
) {
    const existingResults = await db
        .select()
        .from(participantMatchGameResult)
        .where(
            isOpponent1
                ? eq(participantMatchGameResult.opponent1MatchGameId, matchGameId)
                : eq(participantMatchGameResult.opponent2MatchGameId, matchGameId),
        )
        .limit(1);

    const resultData = {
        participantId: value.id != null ? String(value.id) : null,
        forfeit: value.forfeit ?? null,
        position: value.position ?? null,
        score: value.score ?? null,
        result: value.result ? MatchResultTransformer.to(value.result) : null,
    };

    if (existingResults.length > 0) {
        await db
            .update(participantMatchGameResult)
            .set(resultData)
            .where(eq(participantMatchGameResult.id, existingResults[0].id));
    } else {
        await db.insert(participantMatchGameResult).values({
            id: randomUUID(),
            ...resultData,
            ...(isOpponent1
                ? { opponent1MatchGameId: matchGameId }
                : { opponent2MatchGameId: matchGameId }),
        });
    }
}

async function updateById(
    db: DrizzleDatabase,
    id: string,
    value: Partial<MatchGameWithExtra> | MatchGameWithExtra,
    previousExtra?: JsonValue | null,
) {
    let extraSource = previousExtra ?? null;

    if (previousExtra === undefined) {
        const existing = await db
            .select({ extra: matchGame.extra })
            .from(matchGame)
            .where(eq(matchGame.id, id))
            .limit(1);

        extraSource = (existing[0]?.extra as JsonValue) ?? null;
    }

    const extrasInput = value as MatchGameExtrasInput;
    const extra = matchGameExtraFromInput(extrasInput, extraSource);

    const updateData: Record<string, unknown> = {};
    if (value.stage_id !== undefined) updateData.stageId = String(value.stage_id);
    if (value.parent_id !== undefined) updateData.matchId = String(value.parent_id);
    if (value.number !== undefined) updateData.number = value.number;
    if (value.status !== undefined)
        updateData.status = MatchStatusTransformer.to(value.status);
    if (extra !== undefined) updateData.extra = extra;

    if (Object.keys(updateData).length > 0) {
        await db.update(matchGame).set(updateData).where(eq(matchGame.id, id));
    }

    if (value.opponent1) {
        await upsertParticipantResult(db, id, value.opponent1, true);
    }

    if (value.opponent2) {
        await upsertParticipantResult(db, id, value.opponent2, false);
    }
}

export async function handleMatchGameUpdate(
    db: DrizzleDatabase,
    filter: Partial<MatchGameWithExtra> | number | string,
    value: Partial<MatchGameWithExtra> | MatchGameWithExtra,
): Promise<boolean> {
    try {
        if (typeof filter === 'number' || typeof filter === 'string') {
            await updateById(db, String(filter), value);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined)
            conditions.push(eq(matchGame.id, String(filter.id)));
        if (filter.number !== undefined)
            conditions.push(eq(matchGame.number, filter.number));
        if (filter.stage_id !== undefined)
            conditions.push(eq(matchGame.stageId, String(filter.stage_id)));
        if (filter.parent_id !== undefined)
            conditions.push(eq(matchGame.matchId, String(filter.parent_id)));
        if (filter.status !== undefined)
            conditions.push(
                eq(matchGame.status, MatchStatusTransformer.to(filter.status)),
            );

        const games = await db
            .select()
            .from(matchGame)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        await Promise.all(
            games.map((game) =>
                updateById(db, game.id, value, (game.extra as JsonValue) ?? null),
            ),
        );

        return true;
    } catch {
        return false;
    }
}
