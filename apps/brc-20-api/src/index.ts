import { rateLimitMiddleware } from "./middlewares/rate-limiter.js"
import { toadScheduler } from "./scheduler/instance.js"
import { app, logger } from "./server.js"
app.use(rateLimitMiddleware)
app.on("close", () => {
  logger.info("Closing server")
  toadScheduler.stop()
})
