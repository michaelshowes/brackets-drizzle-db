import { CrudInterface, OmitId } from 'brackets-manager';
import { DataTypes } from 'brackets-manager/dist/types';

// ID type that matches brackets-model - supports both string and number
type Id = number | string;
import {
    handleInsert,
    handleDelete,
    handleUpdate,
    handleSelect,
} from './storage-handlers';
import type { DrizzleDatabase } from './db';

// Extended interface that supports text IDs (string or number)
export class SqlDatabase implements CrudInterface {
    private db: DrizzleDatabase;

    constructor(db: DrizzleDatabase) {
        this.db = db;
    }

    // Insert with text IDs requires the caller to provide the id in values
    insert<T extends keyof DataTypes>(
        table: T,
        value: OmitId<DataTypes[T]>,
    ): Promise<number>;
    insert<T extends keyof DataTypes>(
        table: T,
        values: OmitId<DataTypes[T]>[],
    ): Promise<boolean>;
    insert<T extends keyof DataTypes>(
        table: T,
        values: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[],
    ): Promise<number | boolean> {
        // With text IDs, the caller must provide the id - we cast to the expected type
        return handleInsert(
            this.db,
            table,
            values as unknown as DataTypes[T] | DataTypes[T][],
        ) as unknown as Promise<number | boolean>;
    }

    select<T extends keyof DataTypes>(table: T): Promise<DataTypes[T][] | null>;
    select<T extends keyof DataTypes>(
        table: T,
        id: Id,
    ): Promise<DataTypes[T] | null>;
    select<T extends keyof DataTypes>(
        table: T,
        filter: Partial<DataTypes[T]>,
    ): Promise<DataTypes[T][] | null>;
    select<T extends keyof DataTypes>(
        table: T,
        filter?: Partial<DataTypes[T]> | Id,
    ): Promise<DataTypes[T][] | DataTypes[T] | null> {
        return handleSelect(
            this.db,
            table,
            filter as Partial<DataTypes[T]> | number | string,
        ) as unknown as Promise<DataTypes[T][] | DataTypes[T] | null>;
    }

    update<T extends keyof DataTypes>(
        table: T,
        id: Id,
        value: DataTypes[T],
    ): Promise<boolean>;
    update<T extends keyof DataTypes>(
        table: T,
        filter: Partial<DataTypes[T]>,
        value: Partial<DataTypes[T]>,
    ): Promise<boolean>;
    update<T extends keyof DataTypes>(
        table: T,
        filter: Partial<DataTypes[T]> | Id,
        value: Partial<DataTypes[T]> | DataTypes[T],
    ): Promise<boolean> {
        return handleUpdate(
            this.db,
            table,
            filter as Partial<DataTypes[T]> | number,
            value,
        );
    }

    delete<T extends keyof DataTypes>(table: T): Promise<boolean>;
    delete<T extends keyof DataTypes>(
        table: T,
        filter: Partial<DataTypes[T]>,
    ): Promise<boolean>;
    delete<T extends keyof DataTypes>(
        table: T,
        filter?: Partial<DataTypes[T]>,
    ): Promise<boolean> {
        return handleDelete(this.db, table, filter);
    }
}
