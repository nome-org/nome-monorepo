import { defaultEndpointsFactory } from "express-zod-api"
import { z } from "zod"
import { prisma } from "../prisma/client.js"

import { ClaimType } from "@prisma/client"
import { validBTCAddress } from "../util/zod-extras.js"
import createHttpError from "http-errors"
export const checkClaimEndpoint = defaultEndpointsFactory.build({
  shortDescription: "Check a claim",
  description: "Checks if a claim is valid and returns the type",
  method: "get",
  input: z.object({
    address: validBTCAddress,
  }),
  output: z.object({
    status: z.nativeEnum(ClaimType),
  }),
  handler: async ({ input }) => {
    const { address } = input
    const claim = await prisma.claim.findFirst({
      where: {
        ordinalAddress: address,
      },
    })
    if (!claim) {
      throw createHttpError(404, "Claim not found")
    }
    return {
      status: claim.claimType,
    }
  },
})
