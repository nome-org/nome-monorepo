import { AddressPurpose, BitcoinNetworkType, getAddress } from "sats-connect";

import { getWalletAddresses } from "./getWalletAddresses";
import {
  AddressResponseBody,
  BtcAddress,
  PaymentTypes,
  RpcError,
} from "@btckit/types";

type Results = {
  /** @description payment address can be native segwit or segwit or taproot (unisat) */
  paymentAddress: string;
  /** @description ordinal address must be a taproot address */
  ordinalAddress: string;
};

type getAddresses = (params?: {
  message: string;
  networkType: BitcoinNetworkType;
}) => Promise<Results>;

/**
 * @name getAddressesUnisat
 * @description Get the addresses for the user
 */
export const getAddressesUnisat: getAddresses = async () => {
  const unisat = (window as unknown as any).unisat;
  if (!unisat) {
    throw new Error("Unisat not found");
  }
  const results: [string] = await unisat.requestAccounts();

  return {
    ordinalAddress: results[0],
    paymentAddress: results[0],
  };
};

/**
 * @name getAddressXverse
 * @description Get the address for the user
 */
export const getAddressesXverse: getAddresses = (
  params = {
    message: "Please select an account",
    networkType: BitcoinNetworkType.Mainnet,
  },
) => {
  return new Promise<Results>((resolve, reject) => {
    getAddress({
      onCancel: reject,
      onFinish(results) {
        console.log("getAddressXverse", results);
        resolve(getWalletAddresses(results) as Results);
      },
      payload: {
        message: params.message,
        network: {
          type: params.networkType,
        },
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
      },
    });
  });
};

const extractAddressByType = (
  addresses: BtcAddress[],
  addressType: PaymentTypes,
) => {
  return addresses.find((address) => address.type === addressType)?.address;
};
/**
 * @name getAddressesLeather
 * @description Get addresses for leather wallet
 */
export const getAddressesLeather: getAddresses = async () => {
  if (!window.btc) {
    throw new Error("Bitcoin wallet not connected");
  }
  const response = (await window.btc.request("getAddresses", {
    types: ["p2wpkh", "p2tr"],
  })) as unknown as any;
  console.log(response);
  const error = response.error as RpcError | undefined;
  if (error) {
    throw new Error(error.message);
  }

  const { addresses } = response.result as AddressResponseBody;
  const paymentAddress = extractAddressByType(addresses, "p2wpkh")!;
  const ordinalAddress = extractAddressByType(addresses, "p2tr")!;

  return {
    paymentAddress,
    ordinalAddress,
  };
};
