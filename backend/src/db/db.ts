import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { appConfig } from "../config/app-config.js";

const dataDir = path.dirname(appConfig.dbPath);

fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(appConfig.dbPath);

console.log("SQLite DB opened:", appConfig.dbPath);
