import { app } from "./app.js";
import { migrate } from "./db/migrate.js";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await migrate();

  app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});