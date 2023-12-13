import { createConfig } from "express-zod-api";
import type { Logger } from "winston";

const config = createConfig({
  server: {
    listen: process.env.PORT || 8090, // port, UNIX socket or options
  },
  cors: true,
  logger: { level: "debug", color: true },
});

// Setting the type of the logger used
declare module "express-zod-api" {
  interface LoggerOverrides extends Logger {}
}
