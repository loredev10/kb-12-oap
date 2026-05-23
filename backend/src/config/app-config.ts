import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, "..", "..");

function resolveFromBackendDir(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(backendDir, value);
}

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  dbPath: resolveFromBackendDir(process.env.DB_PATH ?? "data/app.db"),
};
