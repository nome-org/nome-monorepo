import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { prisma } from "../prisma/client.js"

import { validBTCAddress } from "../util/zod-extras.js"
import createHttpError from "http-errors"
import { isWhitelistOpen } from "../util/isWhiteListOpen.js"
export const checkClaimEndpoint = defaultEndpointsFactory.build({
  shortDescription: "Check a claim",
  description: "Checks if a claim is valid and returns the type",
  method: "get",
  input: z.object({
    address: validBTCAddress,
  }),
  output: z.object({
    freeAmount: z.number(),
    isWhitelistOpen: z.boolean(),
  }),
  handler: async ({ input }) => {
    const { address } = input
    const claim = await prisma.claim.findFirst({
      where: {
        ordinalAddress: address,
      },
    })

    const wlOpen = await isWhitelistOpen()

    if (!claim || !wlOpen) {
      throw createHttpError(404, "Claim not found")
    }

    return {
      freeAmount: claim.freeAmount - claim.claimedAmount,
      isWhitelistOpen: wlOpen,
    }
  },
})
