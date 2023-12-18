import {
  BASE_POSTAGE,
  INSCRIPTION_WEIGHT,
  PRICE,
  TRANSFER_WEIGHT,
} from "../constants.js"

export const calculatePrice = ({
  feeRate,
  amount,
}: {
  feeRate: number
  amount: number
}) => {
  const minerFees = feeRate * (TRANSFER_WEIGHT + INSCRIPTION_WEIGHT)
  const brc20Price = (PRICE / 1000) * amount

  return {
    brc20Price,
    minerFees,
    basePostage: BASE_POSTAGE,
    total: minerFees + brc20Price + BASE_POSTAGE,
  }
}
