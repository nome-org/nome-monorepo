import { gen_seckey, get_pubkey } from "@cmdcode/crypto-tools/keys"
import { buildTransferJSON } from "./get-payment-address.js"
import { buildCommitData, buildInscriptionTx } from "./inscribe.js"
import { transferInscription } from "./transfer-inscription.js"
import { Address, Tx } from "@cmdcode/tapscript"
import { HDKey } from "@scure/bip32"
import { generateMnemonic, mnemonicToSeed } from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english"

export const getInscribeWeight = async () => {
  const transferInscription = buildTransferJSON(250_000_000)
  const { cblock, inscribingAddress, script, seckey, tpubkey } =
    await buildCommitData({
      file: transferInscription,
      secret: gen_seckey(),
    })
  const { sizeInVBytes } = buildInscriptionTx({
    cblock,
    feeRate: 1,
    recipientAddress: inscribingAddress,
    script,
    seckey,
    tpubkey,
    utxo: {
      amount: 100_000,
      txid: "0000000000000000000000000000000000000000000000000000000000000000",
      vout: 0,
    },
  })
  return sizeInVBytes
}

export const getTransferWeight = async () => {
  const mnemonic = generateMnemonic(wordlist)
  const seed = await mnemonicToSeed(mnemonic)
  const key = HDKey.fromMasterSeed(seed)
  const tx = await transferInscription({
    key,
    recipientAddress: Address.p2tr.fromPubKey(get_pubkey(key.privateKey!)),
    utxo: {
      amount: 100_000,
      txid: "0000000000000000000000000000000000000000000000000000000000000000",
      vout: 0,
    },
  })
  return Tx.util.getTxSize(tx).vsize
}
