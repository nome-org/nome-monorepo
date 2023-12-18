import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { validBuyAmount, validFeeRate } from "../util/zod-extras.js"
import { calculatePrice } from "../util/calculate-price.js"

export const getPriceEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Price",
  description:
    "Gets the price of BRC20 tokens in sats based on the fee rate and amount",
  input: z.object({
    amount: validBuyAmount,
    feeRate: validFeeRate,
  }),
  output: z.object({
    brc20Price: z.number(),
    minerFees: z.number(),
    basePostage: z.number(),
    total: z.number(),
  }),
  handler: async ({ input }) => calculatePrice(input),
})
