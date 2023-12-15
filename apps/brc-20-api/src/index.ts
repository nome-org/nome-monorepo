import { createServer } from "express-zod-api"

import { routing } from "./router.js"
import { config as serverConfig } from "./config.js"

await createServer(serverConfig, routing)
