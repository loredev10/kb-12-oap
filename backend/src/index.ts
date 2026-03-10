import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, _res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (_req: Request, res: Response) => {
  res.send("ROOT OK");
});

app.get("/health", (_req: Request, res: Response) => {
  console.log("GET /health called");
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API started on http://localhost:${PORT}`);
});