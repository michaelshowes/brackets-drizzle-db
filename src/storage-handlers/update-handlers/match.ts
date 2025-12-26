import {
    MatchResultTransformer,
    MatchStatusTransformer,
    matchExtraFromInput,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { match, participantMatchResult } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { MatchExtrasInput, MatchWithExtra, JsonValue } from '../../types';
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
    matchId: string,
    value: ParticipantResultInput,
    isOpponent1: boolean,
) {
    const existingResults = await db
        .select()
        .from(participantMatchResult)
        .where(
            isOpponent1
                ? eq(participantMatchResult.opponent1MatchId, matchId)
                : eq(participantMatchResult.opponent2MatchId, matchId),
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
            .update(participantMatchResult)
            .set(resultData)
            .where(eq(participantMatchResult.id, existingResults[0].id));
    } else {
        await db.insert(participantMatchResult).values({
            id: randomUUID(),
            ...resultData,
            ...(isOpponent1
                ? { opponent1MatchId: matchId }
                : { opponent2MatchId: matchId }),
        });
    }
}

async function updateById(
    db: DrizzleDatabase,
    id: string,
    value: Partial<MatchWithExtra> | MatchWithExtra,
    previousExtra?: JsonValue | null,
) {
    let extraSource = previousExtra ?? null;

    if (previousExtra === undefined) {
        const existing = await db
            .select({ extra: match.extra })
            .from(match)
            .where(eq(match.id, id))
            .limit(1);

        extraSource = (existing[0]?.extra as JsonValue) ?? null;
    }

    const extrasInput = value as MatchExtrasInput;
    const extra = matchExtraFromInput(extrasInput, extraSource);

    const updateData: Record<string, unknown> = {};
    if (value.stage_id !== undefined) updateData.stageId = String(value.stage_id);
    if (value.group_id !== undefined) updateData.groupId = String(value.group_id);
    if (value.round_id !== undefined) updateData.roundId = String(value.round_id);
    if (value.child_count !== undefined) updateData.childCount = value.child_count;
    if (value.number !== undefined) updateData.number = value.number;
    if (value.status !== undefined)
        updateData.status = MatchStatusTransformer.to(value.status);
    if (extra !== undefined) updateData.extra = extra;

    if (Object.keys(updateData).length > 0) {
        await db.update(match).set(updateData).where(eq(match.id, id));
    }

    if (value.opponent1) {
        await upsertParticipantResult(db, id, value.opponent1, true);
    }

    if (value.opponent2) {
        await upsertParticipantResult(db, id, value.opponent2, false);
    }
}

export async function handleMatchUpdate(
    db: DrizzleDatabase,
    filter: Partial<MatchWithExtra> | number | string,
    value: Partial<MatchWithExtra> | MatchWithExtra,
): Promise<boolean> {
    try {
        if (typeof filter === 'number' || typeof filter === 'string') {
            await updateById(db, String(filter), value);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(match.id, String(filter.id)));
        if (filter.number !== undefined)
            conditions.push(eq(match.number, filter.number));
        if (filter.stage_id !== undefined)
            conditions.push(eq(match.stageId, String(filter.stage_id)));
        if (filter.group_id !== undefined)
            conditions.push(eq(match.groupId, String(filter.group_id)));
        if (filter.round_id !== undefined)
            conditions.push(eq(match.roundId, String(filter.round_id)));
        if (filter.status !== undefined)
            conditions.push(
                eq(match.status, MatchStatusTransformer.to(filter.status)),
            );

        const matches = await db
            .select()
            .from(match)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        await Promise.all(
            matches.map((m) =>
                updateById(db, m.id, value, (m.extra as JsonValue) ?? null),
            ),
        );

        return true;
    } catch {
        return false;
    }
}
