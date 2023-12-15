import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { INSCRIPTION_WEIGHT, PRICE, TRANSFER_WEIGHT } from "../constants.js"

export const getPriceEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    amount: z.number().min(1),
    feeRate: z.number().min(1),
  }),
  output: z.object({
    brc20Price: z.number(),
    minerFees: z.number(),
  }),
  handler: async ({ input: { amount, feeRate } }) => {
    const inscriptionFee = INSCRIPTION_WEIGHT * feeRate
    const transferFee = TRANSFER_WEIGHT * feeRate
    const minerFees = inscriptionFee + transferFee
    const brc20Price = (PRICE / 1000) * amount

    return { brc20Price, minerFees }
  },
})
