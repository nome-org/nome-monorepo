import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import { Redis } from "ioredis"

const client = new Redis()
export const rateLimitStore = new RedisStore({
  // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
  sendCommand: (...args: string[]) => client.call(...args),
})

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: rateLimitStore,
})
