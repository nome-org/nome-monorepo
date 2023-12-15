import { toadScheduler } from "./scheduler/instance.js"
import { app, logger } from "./server.js"
app.on("close", () => {
  logger.info("Closing server")
  toadScheduler.stop()
})
