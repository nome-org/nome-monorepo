import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import {
  validBTCAddress,
  validBuyAmount,
  validFeeRate,
} from "../util/zod-extras.js"
import { calculatePrice } from "../util/calculate-price.js"
import { prisma } from "../prisma/client.js"
import { getWLBenefits } from "../util/get-wl-benefits.js"

export const getPriceEndpoint = defaultEndpointsFactory.build({
  method: "get",
  shortDescription: "Price",
  description:
    "Gets the price of BRC20 tokens in sats based on the fee rate and amount",
  input: z.object({
    amount: validBuyAmount,
    feeRate: validFeeRate,
    address: validBTCAddress,
  }),
  output: z.object({
    brc20Price: z.number(),
    minerFees: z.number(),
    basePostage: z.number(),
    total: z.number(),
  }),
  handler: async ({ input: { amount, feeRate, address } }) => {
    const claim = await prisma.claim.findFirst({
      where: {
        ordinalAddress: address,
      },
    })

    const { discount, freeAmount } = getWLBenefits(claim)

    return calculatePrice({
      amount,
      feeRate,
      discount,
      freeAmount,
    })
  },
})
