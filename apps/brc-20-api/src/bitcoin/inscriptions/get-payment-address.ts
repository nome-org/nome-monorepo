import { HDKey } from "@scure/bip32"
import { buildFileInscriptionCommit } from "@repo/ordinals-utils"

export const buildTransferJSON = (amount: number) => {
  return new Blob(
    [`{"p":"brc-20","op":"transfer","tick":"N0ME","amt":"${amount}"}`],
    {
      type: "application/json",
    },
  )
}
export const getPaymentAddress = (key: HDKey, amount: number) => {
  return buildFileInscriptionCommit({
    file: buildTransferJSON(amount),
    secret: key.privateKey!,
    network: process.env.NETWORK_MODE === "testnet" ? "testnet" : "main",
  })
}
