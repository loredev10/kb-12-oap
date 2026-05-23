import { app } from "./app.js";
import { appConfig } from "./config/app-config.js";
import { migrate } from "./db/migrate.js";

async function bootstrap(): Promise<void> {
  await migrate();

  app.listen(appConfig.port, () => {
    console.log(`API started on http://localhost:${appConfig.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
