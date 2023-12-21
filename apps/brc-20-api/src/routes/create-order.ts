import { defaultEndpointsFactory, ez } from "express-zod-api"
import { rateLimitStore } from "../middlewares/rate-limiter.js"
import { z } from "zod"
import {
  idSchema,
  validBTCAddress,
  validBuyAmount,
  validFeeRate,
  validTaprootAddress,
} from "../util/zod-extras.js"
import rateLimit from "express-rate-limit"
import { prisma } from "../prisma/client.js"
import { calculatePrice } from "../util/calculate-price.js"
import { getPaymentAddress } from "../bitcoin/inscriptions/get-payment-address.js"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
import { getWLBenefits } from "../util/get-wl-benefits.js"

export const createOrderEndpoint = defaultEndpointsFactory
  .addExpressMiddleware(
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      store: rateLimitStore,
    }),
  )
  .build({
    shortDescription: "Create a new order",
    description:
      "Create a brc20 buy order based on amount and whitelist status",
    method: "post",
    input: z.object({
      receiveAddress: validBTCAddress,
      amount: validBuyAmount,
      feeRate: validFeeRate,
    }),
    output: z.object({
      id: idSchema,
      paymentAddress: validTaprootAddress,
      receiveAddress: validBTCAddress,
      createdAt: ez.dateOut(),
      updatedAt: ez.dateOut(),
      totalPrice: z.number().describe("Total order price in sats"),
    }),
    handler: async ({ input: { amount, receiveAddress, feeRate } }) => {
      const existingClaim = await prisma.claim.findFirst({
        where: {
          ordinalAddress: receiveAddress,
        },
        include: {
          orders: true,
        },
      })
      let claimId: number | null = null

      const { price, freeAmount } = await getWLBenefits(existingClaim)
      if (freeAmount && existingClaim) {
        claimId = existingClaim.id
        await prisma.claim.update({
          where: {
            id: claimId,
          },
          data: {
            claimedAmount: freeAmount,
          },
        })
      }

      // ensure that the user receives at least the free amount
      if (amount < freeAmount) {
        amount = freeAmount
      }

      const order = await prisma.order.create({
        data: {
          amount,
          receiveAddress,
          claimId,
          feeRate,
        },
      })
      const { total: totalPrice } = calculatePrice({
        feeRate,
        amount,
        price,
        freeAmount,
      })
      const key = await getKeyForIndex(order.id)
      const { inscribingAddress } = await getPaymentAddress(key, amount)
      return {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        id: order.id,
        receiveAddress,
        paymentAddress: inscribingAddress,
        totalPrice,
      }
    },
  })
