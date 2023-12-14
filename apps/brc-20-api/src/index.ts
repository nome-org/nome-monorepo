import { createServer } from "express-zod-api";
import { routing } from "./router";
import { config } from "./config";

createServer(config, routing);
