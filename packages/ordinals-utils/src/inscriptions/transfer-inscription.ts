import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript"
import { BASE_POSTAGE } from "../constants.js"

export const transferInscription = async ({
  pubkey,
  seckey,
  utxo,
  recipientAddress,
}: {
  pubkey: Uint8Array
  seckey: Uint8Array
  utxo: {
    txid: string
    vout: number
    value: number
  }
  recipientAddress: string
}) => {
  const transferTx = Tx.create({
    vin: [
      {
        txid: utxo.txid,
        vout: utxo.vout,
        prevout: {
          value: utxo.value,
          scriptPubKey: ["OP_1", Tap.getPubKey(pubkey)[0]],
        },
      },
    ],
    vout: [
      {
        // any extra goes to the miner
        value: BASE_POSTAGE,
        scriptPubKey: Address.toScriptPubKey(recipientAddress),
      },
    ],
  })

  const [tSeckey] = Tap.getSecKey(seckey)

  const sig = Signer.taproot.sign(tSeckey, transferTx, 0)

  // Let's add this signature to our witness data for input 0.

  transferTx.vin[0].witness = [sig]

  return {
    data: transferTx,
    hex: Tx.encode(transferTx).hex,
  }
}
