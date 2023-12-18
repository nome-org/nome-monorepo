import {
  BASE_POSTAGE,
  INSCRIPTION_WEIGHT,
  PRICE,
  TRANSFER_WEIGHT,
} from "../constants.js"

export const calculatePrice = ({
  feeRate,
  amount,
  discount = 0,
  freeAmount = 0,
}: {
  feeRate: number
  amount: number
  discount?: number
  freeAmount?: number
}) => {
  const minerFees = feeRate * (TRANSFER_WEIGHT + INSCRIPTION_WEIGHT)
  let brc20Price = Math.ceil((PRICE * Math.max(amount - freeAmount, 0)) / 1000)
  if (discount > 0) {
    brc20Price = brc20Price * (1 - discount)
  }
  return {
    brc20Price,
    minerFees,
    basePostage: BASE_POSTAGE,
    total: minerFees + brc20Price + BASE_POSTAGE,
  }
}
