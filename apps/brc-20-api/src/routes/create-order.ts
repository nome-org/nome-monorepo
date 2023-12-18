import { defaultEndpointsFactory, ez } from "express-zod-api"
import { rateLimitStore } from "../middlewares/rate-limiter.js"
import { z } from "zod"
import {
  idSchema,
  validBuyAmount,
  validFeeRate,
  validTaprootAddress,
} from "../util/zod-extras.js"
import rateLimit from "express-rate-limit"
import { prisma } from "../prisma/client.js"
import { calculatePrice } from "../util/calculate-price.js"
import { getPaymentAddress } from "../bitcoin/inscriptions/get-payment-address.js"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
import { ClaimType } from "@prisma/client"

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
      receiveAddress: validTaprootAddress,
      amount: validBuyAmount,
      feeRate: validFeeRate,
    }),
    output: z.object({
      id: idSchema,
      paymentAddress: validTaprootAddress,
      receiveAddress: validTaprootAddress,
      createdAt: ez.dateOut(),
      updatedAt: ez.dateOut(),
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
      let discount = 0
      let freeAmount = 0
      if (existingClaim) {
        claimId = existingClaim.id
        if (existingClaim.claimType === ClaimType.GiveawayWinner) {
          freeAmount = 2000
        }
        if (existingClaim.claimType === ClaimType.Holder) {
          freeAmount = 1000
        }
        discount = 0.2
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
        discount,
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
