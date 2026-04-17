import { db } from "./db.js";

export type RunResult = {
  lastID: number;
  changes: number;
};

export function all<T>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (error: Error | null, rows: T[]) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

export function get<T>(sql: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, (error: Error | null, row: T | undefined) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export function run(sql: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, function (this: RunResult, error: Error | null) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}