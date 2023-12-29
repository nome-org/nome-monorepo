import { Claim } from "@prisma/client"
import { PRICE, WL_PRICE } from "../constants.js"
import { isWhitelistOpen } from "./isWhiteListOpen.js"

export const getWLBenefits = async (claim: Claim | null) => {
  let price = PRICE
  let freeAmount = 0
  const wlOpen = await isWhitelistOpen()
  if (wlOpen) {
    price = WL_PRICE
  }
  if (claim) {
    freeAmount = claim.freeAmount - claim.claimedAmount
  }

  return {
    price,
    freeAmount,
  }
}
