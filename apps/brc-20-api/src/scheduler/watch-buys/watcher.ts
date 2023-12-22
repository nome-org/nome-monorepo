import { AsyncTask, SimpleIntervalJob } from "toad-scheduler"
import { logger } from "../../server.js"

import { isOrderExpired } from "../../util/orders/isOrderExpired.js"
import { fetchPendingOrders } from "./fetchPendingOrders.js"
import { processOrder } from "./processOrder.js"

const watchBuyTxsTask = new AsyncTask(
  "watchBuyTxsTask",
  async () => {
    const pendingOrders = await fetchPendingOrders()
    for (const order of pendingOrders) {
      logger.info(`Processing order ${order.id}`)
      if (isOrderExpired(order)) {
        logger.info(`Order ${order.id} is expired`)
        continue
      }
      await processOrder({ order })
    }
  },
  (err) => {
    logger.error(err)
  },
)

export const watchBuyTxsJob = new SimpleIntervalJob(
  {
    minutes: 3,
  },
  watchBuyTxsTask,
)
