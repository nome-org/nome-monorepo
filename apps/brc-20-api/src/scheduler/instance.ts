import { ToadScheduler } from "toad-scheduler"
import { watchBuyTxsJob } from "./watch-buy-txs.js"
export const toadScheduler = new ToadScheduler()

toadScheduler.addSimpleIntervalJob(watchBuyTxsJob)
