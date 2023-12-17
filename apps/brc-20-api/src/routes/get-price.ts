import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { INSCRIPTION_WEIGHT, PRICE, TRANSFER_WEIGHT } from "../constants.js"

export const getPriceEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Price",
  description: "Gets the price of BRC20 tokens based on the fee rate",
  input: z.object({
    amount: z.number().min(1),
    feeRate: z.number().min(1),
  }),
  output: z.object({
    brc20Price: z.number(),
    minerFees: z.number(),
  }),
  handler: async ({ input: { amount, feeRate } }) => {
    const minerFees = feeRate * (TRANSFER_WEIGHT + INSCRIPTION_WEIGHT)
    const brc20Price = (PRICE / 1000) * amount

    return { brc20Price, minerFees }
  },
})
