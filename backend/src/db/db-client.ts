import { db } from "./db.js";

export type SqlParameter = string | number | bigint | null | Uint8Array;

export type RunResult = {
  lastID: number;
  changes: number;
};

export async function all<T>(
  sql: string,
  params: SqlParameter[] = [],
): Promise<T[]> {
  const statement = db.prepare(sql);
  return statement.all(...params) as T[];
}

export async function get<T>(
  sql: string,
  params: SqlParameter[] = [],
): Promise<T | undefined> {
  const statement = db.prepare(sql);
  return statement.get(...params) as T | undefined;
}

export async function run(
  sql: string,
  params: SqlParameter[] = [],
): Promise<RunResult> {
  const statement = db.prepare(sql);
  const result = statement.run(...params);

  return {
    lastID: Number(result.lastInsertRowid),
    changes: Number(result.changes),
  };
}
