import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, "..", "..");
const defaultFrontendOrigins = ["http://127.0.0.1:5500"];

function resolveFromBackendDir(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(backendDir, value);
}

function parseFrontendOrigins(value: string | undefined): string[] {
  if (!value) {
    return defaultFrontendOrigins;
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultFrontendOrigins;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  dbPath: resolveFromBackendDir(process.env.DB_PATH ?? "data/app.db"),
  nodeEnv,
  isProduction: nodeEnv === "production",
  frontendOrigins: parseFrontendOrigins(process.env.FRONTEND_ORIGINS),
};
