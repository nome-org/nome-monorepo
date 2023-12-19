import { AsyncTask, SimpleIntervalJob } from "toad-scheduler"
import { logger } from "../server.js"
import { prisma } from "../prisma/client.js"
import { OrderStatus } from "@prisma/client"
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

const watchBuyTxsTask = new AsyncTask(
  "watchBuyTxsTask",
  async () => {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.UNPAID],
        },
      },
      include: {
        claim: true,
      },
    })

    for (const order of pendingOrders) {
      logger.info(`Processing order ${order.id}`)
      const key = await getKeyForIndex(order.id)
      const { inscribingAddress } = await getPaymentAddress(key, order.amount)
      const utxos = await mempoolClient.bitcoin.addresses.getAddressTxsUtxo({
        address: inscribingAddress,
      })

      if (utxos.length) {
        logger.info(`Found ${utxos.length} utxos for order ${order.id}`)
        const [utxo] = utxos
        const jsonFile = buildTransferJSON(order.amount)
        const { cblock, script, seckey, tpubkey } = await buildCommitData({
          file: jsonFile,
          secret: key.privateKey!,
        })
        const taprootAddress = await getTaprootAddress(key)

        const { discount, freeAmount } = getWLBenefits(order.claim)

        const priceInfo = calculatePrice({
          amount: order.amount,
          feeRate: order.feeRate,
          discount,
          freeAmount,
        })

        const { txHash: inscribeTxHash, txdata: inscribeTxData } =
          buildInscriptionTx({
            utxo,
            cblock,
            recipientAddress: taprootAddress!,
            minerFee: order.feeRate * INSCRIPTION_WEIGHT,
            script,
            seckey,
            tpubkey,
            price: priceInfo.brc20Price,
          })
        let txid = await postTx(inscribeTxHash.hex)

        logger.info(`Inscription txid: ${txid}`)

        const transferTx = await transferInscription({
          key,
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
              status: OrderStatus.TRANSFERRING,
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
  { minutes: 1 },
  watchBuyTxsTask,
)
