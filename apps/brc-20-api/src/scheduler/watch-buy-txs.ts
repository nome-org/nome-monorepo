import { AsyncTask, SimpleIntervalJob } from "toad-scheduler"
import { logger } from "../server.js"
import { prisma } from "../prisma/client.js"
import { Claim, Order, OrderStatus } from "@prisma/client"
import { mempoolClient, postTx } from "../bitcoin/mempool-client.js"

import {
  buildTransferJSON,
  getPaymentAddress,
} from "../bitcoin/inscriptions/get-payment-address.js"
import {
  getKeyForIndex,
  getTaprootAddress,
} from "../bitcoin/keys/server-keys.js"
import { transferInscription } from "../bitcoin/inscriptions/transfer-inscription.js"
import { Tx } from "@cmdcode/tapscript"
import {
  buildCommitData,
  buildInscriptionTx,
} from "../bitcoin/inscriptions/inscribe.js"
import { INSCRIPTION_WEIGHT } from "../constants.js"
import { calculatePrice } from "../util/calculate-price.js"
import { getWLBenefits } from "../util/get-wl-benefits.js"
import { HDKey } from "@scure/bip32"
import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses.js"

async function fetchPendingOrders() {
  return prisma.order.findMany({
    where: {
      status: OrderStatus.UNPAID,
    },
    include: {
      claim: true,
    },
  })
}

async function inscribeTransfer({
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
  const { cblock, script, seckey, tpubkey } = await buildCommitData({
    file: jsonFile,
    secret: orderKey.privateKey!,
  })
  const taprootAddress = await getTaprootAddress(firstKey)

  const { price, freeAmount } = await getWLBenefits(
    order.claim && { ...order.claim, orders: [order] },
  )

  const priceInfo = calculatePrice({
    amount: order.amount,
    feeRate: order.feeRate,
    price,
    freeAmount,
  })

  const { txHash: inscribeTxHash, txdata: inscribeTxData } = buildInscriptionTx(
    {
      utxo: paymentUTXO,
      cblock,
      recipientAddress: taprootAddress!,
      minerFee: order.feeRate * INSCRIPTION_WEIGHT,
      script,
      seckey,
      tpubkey,
      price: priceInfo.brc20Price,
    },
  )
  await postTx(inscribeTxHash.hex)
  return inscribeTxData
}

const watchBuyTxsTask = new AsyncTask(
  "watchBuyTxsTask",
  async () => {
    const pendingOrders = await fetchPendingOrders()
    for (const order of pendingOrders) {
      logger.info(`Processing order ${order.id}`)
      const orderKey = await getKeyForIndex(order.id)
      const firstKey = await getKeyForIndex(0)
      const { inscribingAddress } = await getPaymentAddress(
        orderKey,
        order.amount,
      )
      const utxos = await mempoolClient.bitcoin.addresses.getAddressTxsUtxo({
        address: inscribingAddress,
      })

      if (utxos.length) {
        logger.info(`Found ${utxos.length} utxos for order ${order.id}`)
        const [utxo] = utxos
        const inscribeTxData = await inscribeTransfer({
          firstKey,
          order,
          orderKey,
          paymentUTXO: utxo,
        })

        let txid = Tx.util.getTxid(inscribeTxData)

        logger.info(`Inscription txid: ${txid}`)

        const transferTx = await transferInscription({
          key: firstKey,
          recipientAddress: order.receiveAddress,
          utxo: {
            txid: Tx.util.getTxid(inscribeTxData),
            value: Number(inscribeTxData.vout[0].value),
            vout: 0,
          },
        })

        txid = await postTx(Tx.encode(transferTx).hex)

        logger.info(`Transfer txid: ${txid}`)

        if (txid) {
          await prisma.order.update({
            where: {
              id: order.id,
            },
            data: {
              paymentTxId: utxos[0].txid,
              transferTxId: txid,
              status: OrderStatus.COMPLETE,
            },
          })
          logger.info(`Completed processing order ${order.id}`)
        }
      }
    }
  },
  (err) => {
    logger.error(err)
  },
)

export const watchBuyTxsJob = new SimpleIntervalJob(
  { minutes: 3 },
  watchBuyTxsTask,
)
