import { createServer } from "express-zod-api";

import { routing } from "./router.js";
import { config as serverConfig } from "./config.js";
import { config as loadEnvVars } from "dotenv";

loadEnvVars();
await createServer(serverConfig, routing);
