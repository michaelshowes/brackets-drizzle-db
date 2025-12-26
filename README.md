# brackets-drizzle-db

This implementation of the [`CrudInterface`](https://drarig29.github.io/brackets-docs/reference/manager/interfaces/CrudInterface.html)
uses [Drizzle ORM](https://orm.drizzle.team/) to store the data in a PostgreSQL database.

## Installation

```bash
pnpm add brackets-drizzle-db
```

## Usage

### Basic Setup

```typescript
import { SqlDatabase, createDatabase } from 'brackets-drizzle-db';
import { BracketsManager } from 'brackets-manager';

// Create the Drizzle database instance
const db = createDatabase(process.env.DATABASE_URL!);

const storage = new SqlDatabase(db);
const manager = new BracketsManager(storage);
```

### Integrating with Your Drizzle Schema

If you already have a Drizzle project, you can import the schema definitions and include them in your own schema:

```typescript
// In your drizzle schema file
import * as bracketsSchema from 'brackets-drizzle-db';

// Export alongside your own schema
export * from './your-tables';
export { bracketsSchema };
```

Then in your drizzle config, make sure to include the brackets schema:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: ['./src/db/schema.ts', './node_modules/brackets-drizzle-db/dist/db/schema/index.js'],
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
```

### Using with an Existing Drizzle Instance

If you already have a Drizzle database instance:

```typescript
import { SqlDatabase } from 'brackets-drizzle-db';
import { BracketsManager } from 'brackets-manager';
import { db } from './your-db-setup';

const storage = new SqlDatabase(db);
const manager = new BracketsManager(storage);
```

### Example with Custom Match Data

```typescript
import { SqlDatabase, createDatabase } from 'brackets-drizzle-db';
import { BracketsManager } from 'brackets-manager';
import type { Match } from 'brackets-model';

type MatchWithWeather = Match & {
  // The schema defines a JSON column named `extra` in the `Match` and `MatchGame` tables.
  // Anything you put in the `extra` object will be stored in that column.
  extra: {
    weather: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
  };
};

const db = createDatabase(process.env.DATABASE_URL!);
const storage = new SqlDatabase(db);
const manager = new BracketsManager(storage);

const stage = await manager.create.stage({
  tournamentId: 1,
  name: 'Example',
  type: 'single_elimination',
  seeding: [
    { name: 'Team 1' },
    { name: 'Team 2' },
    { name: 'Team 3' },
    { name: 'Team 4' },
  ],
});

const currentMatches = await manager.get.currentMatches(stage.id);

await manager.update.match<MatchWithWeather>({
  id: currentMatches[0].id,
  opponent1: { score: 6, result: 'win' },
  opponent2: { score: 3, result: 'loss' },
  extra: {
    weather: 'sunny',
  },
});
```

## Schema

The package exports all Drizzle schema definitions for use in your project:

```typescript
import {
  // Tables
  participant,
  stage,
  stageSettings,
  group,
  round,
  match,
  matchGame,
  participantMatchResult,
  participantMatchGameResult,
  // Enums
  stageTypeEnum,
  grandFinalTypeEnum,
  roundRobinModeEnum,
  seedOrderingEnum,
  matchResultEnum,
  matchStatusEnum,
} from 'brackets-drizzle-db';
```
