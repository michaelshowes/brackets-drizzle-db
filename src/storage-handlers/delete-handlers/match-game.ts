import { DataTypes } from 'brackets-manager/dist/types';
import { MatchStatusTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { matchGame, participantMatchGameResult } from '../../db/schema';
import { eq, and, inArray, or } from 'drizzle-orm';

export async function handleMatchGameDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['match_game']>,
): Promise<boolean> {
    try {
        if (!filter) {
            // Delete participant results first, then match games
            await db.delete(participantMatchGameResult);
            await db.delete(matchGame);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined)
            conditions.push(eq(matchGame.id, String(filter.id)));
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

        // Find matching match games
        const games = await db
            .select({ id: matchGame.id })
            .from(matchGame)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        if (games.length === 0) return true;

        const gameIds = games.map((g) => g.id);

        // Delete related participant results first
        await db.delete(participantMatchGameResult).where(
            or(
                inArray(participantMatchGameResult.opponent1MatchGameId, gameIds),
                inArray(participantMatchGameResult.opponent2MatchGameId, gameIds),
            ),
        );

        // Then delete the match games
        await db.delete(matchGame).where(inArray(matchGame.id, gameIds));

        return true;
    } catch {
        return false;
    }
}
