import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sqlite3 = require("sqlite3").verbose() as typeof import("sqlite3");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new sqlite3.Database(dbPath, (error: Error | null) => {
  if (error) {
    console.error("Failed to open SQLite DB:", error.message);
    process.exit(1);
  }

  console.log("SQLite DB opened:", dbPath);
});