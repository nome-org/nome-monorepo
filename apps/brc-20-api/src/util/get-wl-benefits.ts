import { Claim, Order } from "@prisma/client"
import { isWhitelistOpen } from "./isWhiteListOpen.js"

export const getWLBenefits = async (
  claim: (Claim & { orders: Order[] }) | null,
) => {
  let discount = 0
  let freeAmount = 0
  const wlOpen = await isWhitelistOpen()
  if (claim && wlOpen) {
    freeAmount = claim.freeAmount - claim.claimedAmount

    discount = 0.2
  }

  return {
    discount,
    freeAmount,
  }
}
