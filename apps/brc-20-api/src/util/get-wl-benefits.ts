import { Claim } from "@prisma/client"
import { PRICE, WL_PRICE } from "../constants.js"

export const getWLBenefits = async (claim: Claim | null) => {
  let price = PRICE
  let freeAmount = 0
  if (claim) {
    freeAmount = claim.freeAmount - claim.claimedAmount

    price = WL_PRICE
  }

  return {
    price,
    freeAmount,
  }
}
