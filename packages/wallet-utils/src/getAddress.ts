import {
  AddressPurpose,
  BitcoinNetworkType,
  GetAddressResponse,
  getAddress,
} from "sats-connect";

import {
  AddressResponseBody,
  BtcAddress,
  PaymentTypes,
  RpcError,
} from "@btckit/types";
import { getLeatherBTCProvider } from "./util/btc-provider";
import { AppNetworkType } from "..";

type Results = {
  /** @description payment address can be native segwit or segwit or taproot (unisat) */
  paymentAddress: string;
  /** @description ordinal address must be a taproot address */
  ordinalAddress: string;
};

type getAddresses = (params?: {
  message: string;
  networkType: AppNetworkType;
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
const getAddressByPurpose = (
  response: GetAddressResponse,
  purpose: AddressPurpose,
) => response.addresses.find((item) => item.purpose === purpose)?.address;

export function getWalletAddresses(response: GetAddressResponse) {
  let ordinalAddress = getAddressByPurpose(response, AddressPurpose.Ordinals);
  let paymentAddress = getAddressByPurpose(response, AddressPurpose.Payment);
  return {
    ordinalAddress,
    paymentAddress,
  };
}

/**
 * @name getAddressXverse
 * @description Get the address for the user
 */
export const getAddressesXverse: getAddresses = (
  params = {
    message: "Please select an account",
    networkType: "mainnet",
  },
) => {
  return new Promise<Results>((resolve, reject) => {
    getAddress({
      onCancel: reject,
      onFinish(results) {
        resolve(getWalletAddresses(results) as Results);
      },
      payload: {
        message: params.message,
        network: {
          type:
            params.networkType === "mainnet"
              ? BitcoinNetworkType.Mainnet
              : BitcoinNetworkType.Testnet,
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
  const btc = getLeatherBTCProvider();
  const response = (await btc.request("getAddresses", {
    types: ["p2wpkh", "p2tr"],
  })) as unknown as any;
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
