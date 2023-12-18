import { Claim, ClaimType } from "@prisma/client"

export const getWLBenefits = (claim: Claim | null) => {
  let discount = 0
  let freeAmount = 0
  if (!claim) {
    return {
      discount,
      freeAmount,
    }
  }
  if (claim.claimType === ClaimType.GiveawayWinner) {
    freeAmount = 2000
  }
  if (claim.claimType === ClaimType.Holder) {
    freeAmount = 1000
  }
  discount = 0.2

  return {
    discount,
    freeAmount,
  }
}
