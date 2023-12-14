import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { ClaimStatus } from "@prisma/client";
import { validate } from "bitcoin-address-validation";
export const checkClaimEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    address: z.string().refine((value) => {
      return validate(value);
    }),
  }),
  output: z.object({
    status: z.nativeEnum(ClaimStatus),
  }),
  handler: async ({ input }) => {
    const { address } = input;
    const claim = await prisma.claim.findFirst({
      where: {
        ordinalAddress: address,
      },
    });
    if (!claim) {
      throw new Error("Claim not found");
    }
    return {
      status: claim.status,
    };
  },
});
