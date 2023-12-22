import { Order, OrderStatus } from "@prisma/client"
import { prisma } from "../../prisma/client.js"

export async function markOrderComplete({
  order,
  transferTxId,
  paymentTxId,
}: {
  order: Order
  transferTxId: string
  paymentTxId: string
}) {
  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentTxId,
      transferTxId,
      status: OrderStatus.COMPLETE,
    },
  })
}
