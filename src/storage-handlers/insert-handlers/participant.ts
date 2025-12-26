import { DataTypes } from 'brackets-manager/dist/types';
import { ParticipantTransformer } from '../../transformers';
import type { DrizzleDatabase } from '../../db';
import { participant } from '../../db/schema';

// Participant insert requires an id to be provided since we're using text IDs
type ParticipantInsertInput = DataTypes['participant'];

export async function handleParticipantInsert(
    db: DrizzleDatabase,
    values: ParticipantInsertInput | ParticipantInsertInput[],
): Promise<string | boolean> {
    try {
        if (Array.isArray(values)) {
            await db.insert(participant).values(
                values.map((p) => {
                    const value = ParticipantTransformer.to(p);
                    return { id: String(p.id), ...value, extra: value.extra ?? undefined };
                }),
            );
            return true;
        }

        const value = ParticipantTransformer.to(values);
        const result = await db
            .insert(participant)
            .values({ id: String(values.id), ...value, extra: value.extra ?? undefined })
            .returning({ id: participant.id });

        return result[0]?.id ?? '';
    } catch {
        return Array.isArray(values) ? false : '';
    }
}
