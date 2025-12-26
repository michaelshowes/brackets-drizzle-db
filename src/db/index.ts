import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DrizzleDatabase = ReturnType<typeof createDatabase>;

export function createDatabase(connectionString: string) {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
}

export { schema };

