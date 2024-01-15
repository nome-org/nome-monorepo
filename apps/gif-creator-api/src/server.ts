import { createServer } from "express-zod-api";
import { routing } from "./router/router";
import { config as serverConfig } from "./server-config";
import { toadScheduler } from "./scheduler/toad";
// import { checkUserBalance } from "./lib/brc/check-user-balance";

const { app, logger } = createServer(serverConfig, routing);
export { app, logger };

// checkUserBalance({
//     address: "bc1puhu9s8vwmc8z2qn6k2fyv0h47l3tw7smde0mu8gyzemdjatjwn4qc4sjep",
// });
app.on("close", () => {
    logger.info("Closing server");
    toadScheduler.stop();
});
