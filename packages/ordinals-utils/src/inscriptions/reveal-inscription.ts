import { Buff } from "@cmdcode/buff"
import { keys } from "@cmdcode/crypto-tools"
import { ScriptData, Tap, Tx, Address, Signer } from "@cmdcode/tapscript"

export const revealInscription = ({
  utxo,
  cblock,
  tpubkey,
  seckey,
  script,
  recipientAddress,
  minerFee,
  price = 0,
  treasuryAddress,
}: {
  cblock: string
  tpubkey: string
  seckey: Buff
  script: ScriptData
  recipientAddress: string
  utxo: {
    txid: string
    vout: number
    value: number
  }
  minerFee: number
  price?: number
  treasuryAddress?: string
}) => {
  const pubkey = keys.get_pubkey(seckey, true)

  const tapleaf = Tap.encodeScript(script)

  const txdata = Tx.create({
    vin: [
      {
        // Use the txid of the funding transaction used to send the sats.
        txid: utxo.txid,
        // Specify the index value of the output that you are going to spend from.
        vout: utxo.vout,
        // Also include the value and script of that output.
        prevout: {
          // Feel free to change this if you sent a different amount.
          value: utxo.value,
          // This is what our address looks like in script form.
          scriptPubKey: ["OP_1", tpubkey],
        },
      },
    ],
    vout: [
      {
        // Postage to be used when transferring
        // should equal BASE_POSTAGE + (TRANSFER_FEE * FEE_RATE)
        value: utxo.value - price - minerFee,
        // This is the new script that we are locking our funds to.
        scriptPubKey: Address.toScriptPubKey(recipientAddress),
      },
    ],
  })

  if (price && treasuryAddress) {
    txdata.vout.push({
      value: price,
      scriptPubKey: Address.toScriptPubKey(treasuryAddress),
    })
  }

  // For this example, we are signing for input 0 of our transaction,
  // using the untweaked secret key. We are also extending the signature
  // to include a commitment to the tapleaf script that we wish to use.
  const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

  // Add the signature to our witness data for input 0, along with the script
  // and merkle proof (cblock) for the script.
  txdata.vin[0].witness = [sig, script, cblock]

  // Check if the signature is valid for the provided public key, and that the
  // transaction is also valid (the merkle proof will be validated as well).
  Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

  const { vsize: sizeInVBytes } = Tx.util.getTxSize(txdata)

  return {
    txdata,
    txHash: Tx.encode(txdata),
    sizeInVBytes,
    txId: Tx.util.getTxid(txdata),
  }
}
