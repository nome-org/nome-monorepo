import { Address } from "@cmdcode/tapscript"
import { getInscribeWeight, getTransferWeight } from "./fee-calculator.js"
import { describe, expect, test, vi } from "vitest"
import { gen_seckey, get_pubkey } from "@cmdcode/crypto-tools/keys"
vi.stubEnv(
  "TREASURY_ADDRESS",
  // don't ask please
  Address.p2wpkh.fromPubKey(get_pubkey(gen_seckey())),
)
describe("get inscribe weight", () => {
  test("get inscribe weight", async () => {
    expect(await getInscribeWeight()).toBeGreaterThan(160)
  })
})

describe("get transfer weight", () => {
  test("get transfer weight", async () => {
    expect(await getTransferWeight()).toBeGreaterThan(100)
  })
})
