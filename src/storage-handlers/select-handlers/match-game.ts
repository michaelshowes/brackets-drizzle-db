import {
    MatchStatusTransformer,
    MatchGameTransformer,
} from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { matchGame, participantMatchGameResult } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { MatchGameWithExtra } from '../../types';

export async function handleMatchGameSelect(
    db: DrizzleDatabase,
    filter?: Partial<MatchGameWithExtra> | number | string,
): Promise<MatchGameWithExtra[] | MatchGameWithExtra | null> {
    try {
        if (filter === undefined) {
            const games = await db
                .select()
                .from(matchGame)
                .orderBy(asc(matchGame.number));

            return Promise.all(
                games.map(async (game) => {
                    const opponents = await getOpponents(db, game.id);
                    return MatchGameTransformer.from({
                        ...game,
                        ...opponents,
                    });
                }),
            );
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(matchGame)
                .where(eq(matchGame.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            const opponents = await getOpponents(db, values[0].id);
            return MatchGameTransformer.from({
                ...values[0],
                ...opponents,
            });
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(matchGame.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(matchGame.stageId, String(filter.stage_id)));
        if (filter.parent_id !== undefined)
            conditions.push(eq(matchGame.matchId, String(filter.parent_id)));
        if (filter.number !== undefined)
            conditions.push(eq(matchGame.number, filter.number));
        if (filter.status !== undefined)
            conditions.push(
                eq(matchGame.status, MatchStatusTransformer.to(filter.status)),
            );

        const games = await db
            .select()
            .from(matchGame)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(matchGame.number));

        return Promise.all(
            games.map(async (game) => {
                const opponents = await getOpponents(db, game.id);
                return MatchGameTransformer.from({
                    ...game,
                    ...opponents,
                });
            }),
        );
    } catch {
        return [];
    }
}

async function getOpponents(db: DrizzleDatabase, matchGameId: string) {
    const opponent1Results = await db
        .select()
        .from(participantMatchGameResult)
        .where(eq(participantMatchGameResult.opponent1MatchGameId, matchGameId))
        .limit(1);

    const opponent2Results = await db
        .select()
        .from(participantMatchGameResult)
        .where(eq(participantMatchGameResult.opponent2MatchGameId, matchGameId))
        .limit(1);

    return {
        opponent1Result: opponent1Results[0] ?? null,
        opponent2Result: opponent2Results[0] ?? null,
    };
}
