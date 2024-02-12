import {
  getKeyForIndex,
  getTaprootAddress,
} from "../bitcoin/keys/server-keys.js"
import {
  buildFileInscriptionCommit,
  revealInscription,
} from "@repo/ordinals-utils"
import { mempoolClient } from "../bitcoin/mempool-client.js"
import {
  buildTransferJSON,
  getPaymentAddress,
} from "../bitcoin/inscriptions/get-payment-address.js"
import { calculatePrice } from "../util/calculate-price.js"
import { INSCRIPTION_WEIGHT, WL_PRICE } from "../constants.js"
import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses.js"

const FEE_RATE = 13

const inscribe = async ({
  amount,
  freeAmount = 0,
  paymentUTXO,
}: {
  amount: number
  freeAmount: number
  paymentUTXO: AddressTxsUtxo
}) => {
  const jsonFile = buildTransferJSON(amount)
  const { cblock, script, seckey, tpubkey } = await buildFileInscriptionCommit({
    file: jsonFile,
    secret: orderKey.privateKey!,
    network: process.env.NETWORK_MODE === "testnet" ? "testnet" : "main",
  })
  const taprootAddress = await getTaprootAddress(firstKey)

  const priceInfo = calculatePrice({
    amount: amount,
    feeRate: FEE_RATE,
    price: WL_PRICE,
    freeAmount,
  })

  const {
    txHash: inscribeTxHash,
    // txdata: inscribeTxData,
    // txId,
  } = revealInscription({
    utxo: paymentUTXO,
    cblock,
    recipientAddress: taprootAddress!,
    minerFee: FEE_RATE * INSCRIPTION_WEIGHT,
    script,
    seckey,
    tpubkey,
    price: priceInfo.brc20Price,
    treasuryAddress: process.env.TREASURY_ADDRESS!,
  })

  console.log(inscribeTxHash.hex)
}

const orderId = Number(process.argv[2])
const amount = Number(process.argv[3])
const orderKey = await getKeyForIndex(orderId, true)
const firstKey = await getKeyForIndex(0, true)
const { inscribingAddress } = await getPaymentAddress(orderKey, amount)
console.log({ inscribingAddress })
const utxos = await mempoolClient.bitcoin.addresses.getAddressTxsUtxo({
  address: inscribingAddress,
})
if (utxos.length) {
  console.log(`Found ${utxos.length} utxos for order ${orderId}`)
  const [utxo] = utxos
  inscribe({
    amount,
    freeAmount: 1000,
    paymentUTXO: utxo,
  })

  console.log(`Completed processing order ${orderId}`)
}
