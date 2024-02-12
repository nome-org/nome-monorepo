import { transferInscription } from "@repo/ordinals-utils"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
import { mempoolClient } from "../bitcoin/mempool-client.js"

const txid = process.argv[2]
const recipient = process.argv[3]
const firstKey = await getKeyForIndex(0, true)

const tx = await mempoolClient.bitcoin.transactions.getTx({ txid })

const transferTx = await transferInscription({
  pubkey: firstKey.publicKey!,
  seckey: firstKey.privateKey!,
  recipientAddress: recipient,
  utxo: {
    txid,
    value: Number(tx.vout[0].value),
    vout: 0,
  },
})

console.log(transferTx.hex)
