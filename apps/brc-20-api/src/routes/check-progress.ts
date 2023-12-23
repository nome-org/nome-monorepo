import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { prisma } from "../prisma/client.js"
import { OrderStatus } from "@prisma/client"

export const checkProgressEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Check sale progress",
  description: "How much tokens have been sold",
  input: z.object({}),
  output: z.object({
    progress: z.number(),
  }),
  handler: async () => {
    const {
      _sum: { amount: progress },
    } = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: OrderStatus.COMPLETE,
      },
    })
    return { progress: progress || 0 }
  },
})
