import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { all, run } from "./db-client.js";

type MigrationRow = {
  filename: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => `${part};`);
}

export async function migrate(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, "..", "..", "migrations");

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const appliedRows = await all<MigrationRow>(`
    SELECT filename
    FROM schema_migrations
    ORDER BY filename ASC;
  `);

  const appliedFilenames = new Set(appliedRows.map((row) => row.filename));

  for (const file of files) {
    if (appliedFilenames.has(file)) {
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8").trim();

    if (!sql) {
      continue;
    }

    const statements = splitSqlStatements(sql);

    try {
      for (const statement of statements) {
        await run(statement);
      }

      const now = new Date().toISOString();

      await run(
        `
          INSERT INTO schema_migrations (filename, applied_at)
          VALUES (?, ?);
        `,
        [file, now],
      );

      console.log(`Migration applied: ${file}`);
    } catch (error) {
      try {
        await run("ROLLBACK;");
      } catch {
        // якщо транзакція не була відкрита, просто ігноруємо
      }

      throw error;
    }
  }
}