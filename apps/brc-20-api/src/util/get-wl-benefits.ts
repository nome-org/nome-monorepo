import { Claim, Order } from "@prisma/client"
import { isWhitelistOpen } from "./isWhiteListOpen.js"
import { PRICE, WL_PRICE } from "../constants.js"

export const getWLBenefits = async (
  claim: (Claim & { orders: Order[] }) | null,
) => {
  let price = PRICE
  let freeAmount = 0
  const wlOpen = await isWhitelistOpen()
  if (claim && wlOpen) {
    freeAmount = claim.freeAmount - claim.claimedAmount

    price = WL_PRICE
  }

  return {
    price,
    freeAmount,
  }
}
