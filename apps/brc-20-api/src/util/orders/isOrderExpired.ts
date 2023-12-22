import { Order } from "@prisma/client"

export function isOrderExpired(order: Order) {
  return order.expiresAt.getTime() < Date.now()
}
