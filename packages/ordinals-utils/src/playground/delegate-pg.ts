import { gen_seckey } from "@cmdcode/crypto-tools/keys"
import { buildDelegateInscriptionCommit } from "../inscriptions/delegate-inscription.js"
import { Buff } from "@cmdcode/buff"
import { revealInscription } from "../inscriptions/reveal-inscription.js"

console.log(gen_seckey().hex)
async function commitExample() {
  const inscriptionId = ``
  const secret = Buff.hex("")
  return buildDelegateInscriptionCommit({
    inscriptionId,
    secret,
    network: "testnet",
  })
}

async function revealExample() {
  const { cblock, inscribingAddress, script, seckey, tpubkey } =
    await commitExample()

  console.log(inscribingAddress)
  const { txHash } = revealInscription({
    utxo: {
      txid: "",
      value: 10000,
      vout: 0,
    },
    cblock,
    minerFee: 2000,
    recipientAddress: "",
    script,
    seckey,
    tpubkey,
    price: 5000,
    treasuryAddress: "",
  })

  console.log({
    // sizeInVBytes,
    txHash: txHash.hex,
    // txId,
    // txdata,
  })
}

revealExample()
