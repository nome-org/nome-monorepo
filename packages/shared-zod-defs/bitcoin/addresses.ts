import {
  AddressType,
  getAddressInfo,
  validate,
} from "bitcoin-address-validation";
import { z } from "zod";

export const idSchema = z.number({
  description: "Unique ID of the object",
});

export const safeString = z
  .string({
    description: "String max 255 characters",
  })
  .max(255);

export const validBTCAddress = safeString
  .refine((value) => {
    return validate(value);
  })
  .describe("Valid BTC address");

export const validTaprootAddress = validBTCAddress
  .refine((value) => {
    return getAddressInfo(value).type === AddressType.p2tr;
  })
  .describe("Valid taproot address");
