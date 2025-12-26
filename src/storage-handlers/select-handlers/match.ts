import { MatchStatusTransformer, MatchTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { match, participantMatchResult, round } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { MatchWithExtra } from '../../types';

export async function handleMatchSelect(
    db: DrizzleDatabase,
    filter?: Partial<MatchWithExtra> | number | string,
): Promise<MatchWithExtra[] | MatchWithExtra | null> {
    try {
        if (filter === undefined) {
            const matches = await db
                .select()
                .from(match)
                .leftJoin(round, eq(match.roundId, round.id))
                .orderBy(asc(round.number), asc(match.number));

            return Promise.all(
                matches.map(async (row) => {
                    const opponents = await getOpponents(db, row.Match.id);
                    return MatchTransformer.from({
                        ...row.Match,
                        ...opponents,
                    });
                }),
            );
        }

        if (typeof filter === 'number' || typeof filter === 'string') {
            const values = await db
                .select()
                .from(match)
                .where(eq(match.id, String(filter)))
                .limit(1);

            if (values.length === 0) {
                return null;
            }

            const opponents = await getOpponents(db, values[0].id);
            return MatchTransformer.from({
                ...values[0],
                ...opponents,
            });
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
        if (filter.child_count !== undefined)
            conditions.push(eq(match.childCount, filter.child_count));

        const matches = await db
            .select()
            .from(match)
            .leftJoin(round, eq(match.roundId, round.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(round.number), asc(match.number));

        return Promise.all(
            matches.map(async (row) => {
                const opponents = await getOpponents(db, row.Match.id);
                return MatchTransformer.from({
                    ...row.Match,
                    ...opponents,
                });
            }),
        );
    } catch {
        return [];
    }
}

async function getOpponents(db: DrizzleDatabase, matchId: string) {
    const opponent1Results = await db
        .select()
        .from(participantMatchResult)
        .where(eq(participantMatchResult.opponent1MatchId, matchId))
        .limit(1);

    const opponent2Results = await db
        .select()
        .from(participantMatchResult)
        .where(eq(participantMatchResult.opponent2MatchId, matchId))
        .limit(1);

    return {
        opponent1Result: opponent1Results[0] ?? null,
        opponent2Result: opponent2Results[0] ?? null,
    };
}
