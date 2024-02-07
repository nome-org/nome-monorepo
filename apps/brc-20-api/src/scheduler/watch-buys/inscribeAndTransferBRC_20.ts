import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses.js"
import { Order, Claim } from "@repo/brc-20-db"
import { HDKey } from "@scure/bip32"

import { postTx } from "../../bitcoin/mempool-client.js"
import { logger } from "../../server.js"
import { inscribeTransfer } from "./inscribeTransfer.js"
import { transferInscription } from "@repo/ordinals-utils"

export async function inscribeAndTransferBRC_20({
  firstKey,
  order,
  orderKey,
  utxo,
}: {
  firstKey: HDKey
  order: Order & { claim: Claim | null }
  orderKey: HDKey
  utxo: AddressTxsUtxo
}) {
  const { inscribeTxData, txId } = await inscribeTransfer({
    firstKey,
    order,
    orderKey,
    paymentUTXO: utxo,
  })

  logger.info(`Inscription txid: ${txId}`)

  const transferTx = await transferInscription({
    pubkey: firstKey.publicKey!,
    seckey: firstKey.privateKey!,
    recipientAddress: order.receiveAddress,
    utxo: {
      txid: txId,
      value: Number(inscribeTxData.vout[0].value),
      vout: 0,
    },
  })

  const transferTxId = await postTx(transferTx.hex)

  logger.info(`Transfer txid: ${transferTxId}`)

  return {
    inscribeTxId: txId,
    transferTxId,
  }
}
