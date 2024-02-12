import { getPaymentAddress } from "../bitcoin/inscriptions/get-payment-address.js"
import { getKeyForIndex } from "../bitcoin/keys/server-keys.js"
const address = process.argv[2]

let i = 0
// eslint-disable-next-line no-constant-condition
while (true) {
  const key = await getKeyForIndex(i, true)
  const { inscribingAddress } = await getPaymentAddress(key, 5000)
  // console.log("current address", keyAddress)
  if (address === inscribingAddress || i > 10000) {
    console.log({
      orderId: i,
    })
    break
  }
  i++
}
