import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import {
  INSCRIPTION_WEIGHT,
  TRANSFER_WEIGHT,
  PRICE,
  BASE_POSTAGE,
} from "../constants.js"
import { validBuyAmount, validFeeRate } from "../util/zod-extras.js"

export const getPriceEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Price",
  description: "Gets the price of BRC20 tokens based on the fee rate",
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
  handler: async ({ input: { amount, feeRate } }) => {
    const minerFees = feeRate * (TRANSFER_WEIGHT + INSCRIPTION_WEIGHT)
    const brc20Price = (PRICE / 1000) * amount

    return {
      brc20Price,
      minerFees,
      basePostage: BASE_POSTAGE,
      total: minerFees + brc20Price + BASE_POSTAGE,
    }
  },
})
