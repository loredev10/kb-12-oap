import express, { type Request, type Response } from "express";
import { frontendDir } from "./utils/paths.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { accessRequestsRouter } from "./routes/access-requests.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { approvalsRouter } from "./routes/approvals.routes.js";

export const app = express();

app.use(express.json());
app.use(logger);

// API
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.use("/api/users", usersRouter);
app.use("/api/access-requests", accessRequestsRouter);
app.use("/api/approvals", approvalsRouter);

// Frontend static files
app.use(express.static(frontendDir));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(`${frontendDir}/index.html`);
});

app.use(notFoundHandler);
app.use(errorHandler);