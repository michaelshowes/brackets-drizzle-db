import { DataTypes } from 'brackets-manager/dist/types';
import { MatchStatusTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { match, participantMatchResult } from '../../db/schema';
import { eq, and, inArray, or } from 'drizzle-orm';

export async function handleMatchDelete(
    db: DrizzleDatabase,
    filter?: Partial<DataTypes['match']>,
): Promise<boolean> {
    try {
        if (!filter) {
            // Delete participant results first, then matches
            await db.delete(participantMatchResult);
            await db.delete(match);
            return true;
        }

        const conditions = [];
        if (filter.id !== undefined) conditions.push(eq(match.id, String(filter.id)));
        if (filter.stage_id !== undefined)
            conditions.push(eq(match.stageId, String(filter.stage_id)));
        if (filter.group_id !== undefined)
            conditions.push(eq(match.groupId, String(filter.group_id)));
        if (filter.round_id !== undefined)
            conditions.push(eq(match.roundId, String(filter.round_id)));
        if (filter.number !== undefined)
            conditions.push(eq(match.number, filter.number));
        if (filter.status !== undefined)
            conditions.push(
                eq(match.status, MatchStatusTransformer.to(filter.status)),
            );

        // Find matching matches
        const matches = await db
            .select({ id: match.id })
            .from(match)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        if (matches.length === 0) return true;

        const matchIds = matches.map((m) => m.id);

        // Delete related participant results first
        await db.delete(participantMatchResult).where(
            or(
                inArray(participantMatchResult.opponent1MatchId, matchIds),
                inArray(participantMatchResult.opponent2MatchId, matchIds),
            ),
        );

        // Then delete the matches
        await db.delete(match).where(inArray(match.id, matchIds));

        return true;
    } catch {
        return false;
    }
}
