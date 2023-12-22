import { Order } from "@prisma/client"
import { ORDER_EXPIRATION_TIME } from "../../constants.js"

export function isOrderExpired(order: Order) {
  return order.createdAt.getTime() + ORDER_EXPIRATION_TIME < Date.now()
}
