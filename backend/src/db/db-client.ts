import { db } from "./db.js";

export type RunResult = {
  lastID: number;
  changes: number;
};

export async function all<T>(sql: string): Promise<T[]> {
  const statement = db.prepare(sql);
  return statement.all() as T[];
}

export async function get<T>(sql: string): Promise<T | undefined> {
  const statement = db.prepare(sql);
  return statement.get() as T | undefined;
}

export async function run(sql: string): Promise<RunResult> {
  const statement = db.prepare(sql);
  const result = statement.run();

  return {
    lastID: Number(result.lastInsertRowid),
    changes: Number(result.changes),
  };
}