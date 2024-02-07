import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses.js"
import { Order, Claim } from "@repo/brc-20-db"
import { HDKey } from "@scure/bip32"
import { buildTransferJSON } from "../../bitcoin/inscriptions/get-payment-address.js"

import { getTaprootAddress } from "../../bitcoin/keys/server-keys.js"
import { postTx } from "../../bitcoin/mempool-client.js"
import { INSCRIPTION_WEIGHT } from "../../constants.js"
import { calculatePrice } from "../../util/calculate-price.js"
import { getWLBenefits } from "../../util/get-wl-benefits.js"
import {
  buildFileInscriptionCommit,
  revealInscription,
} from "@repo/ordinals-utils"

export async function inscribeTransfer({
  firstKey,
  order,
  orderKey,
  paymentUTXO,
}: {
  order: Order & { claim: Claim | null }
  firstKey: HDKey
  orderKey: HDKey
  paymentUTXO: AddressTxsUtxo
}) {
  const jsonFile = buildTransferJSON(order.amount)
  const { cblock, script, seckey, tpubkey } = await buildFileInscriptionCommit({
    file: jsonFile,
    secret: orderKey.privateKey!,
    network: process.env.NETWORK_MODE === "testnet" ? "testnet" : "main",
  })
  const taprootAddress = await getTaprootAddress(firstKey)

  const { price, freeAmount } = await getWLBenefits(order.claim)

  const priceInfo = calculatePrice({
    amount: order.amount,
    feeRate: order.feeRate,
    price,
    freeAmount,
  })

  const {
    txHash: inscribeTxHash,
    txdata: inscribeTxData,
    txId,
  } = revealInscription({
    utxo: paymentUTXO,
    cblock,
    recipientAddress: taprootAddress!,
    minerFee: order.feeRate * INSCRIPTION_WEIGHT,
    script,
    seckey,
    tpubkey,
    price: priceInfo.brc20Price,
    treasuryAddress: process.env.TREASURY_ADDRESS!,
  })
  await postTx(inscribeTxHash.hex)
  return {
    inscribeTxData,
    txId,
  }
}
