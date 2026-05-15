import cors from "cors";
import express, { type Request, type Response } from "express";
import { frontendDir } from "./utils/paths.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { accessRequestsRouter } from "./routes/access-requests.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { approvalsRouter } from "./routes/approvals.routes.js";

export const app = express();

const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// API v1 — основні маршрути для ЛР4
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