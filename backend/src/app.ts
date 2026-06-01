import cors from "cors";
import express, { type Request, type Response } from "express";
import { appConfig } from "./config/app-config.js";
import { frontendDir } from "./utils/paths.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { securityHeaders } from "./middleware/security-headers.js";
import { accessRequestsRouter } from "./routes/access-requests.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { approvalsRouter } from "./routes/approvals.routes.js";

export const app = express();

app.disable("x-powered-by");

const corsOptions: cors.CorsOptions = {
  origin: appConfig.frontendOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Demo-UserId"],
};

// Middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// Educational endpoint for local bad-scenario testing.
// Production mode does not expose this development-only route.
if (!appConfig.isProduction) {
  app.get("/api/v1/debug/500", (_req: Request, _res: Response) => {
    throw new Error("Lab 5 test error: internal details must stay server-side");
  });
}

// API v1 — основні маршрути для ЛР5
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/access-requests", accessRequestsRouter);
app.use("/api/v1/approvals", approvalsRouter);

// Frontend static files
app.use(express.static(frontendDir));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(`${frontendDir}/index.html`);
});

app.use(notFoundHandler);
app.use(errorHandler);
