import {
  privateKeyToString,
  makeRandomPrivKey,
  publicKeyToString,
  compressPublicKey,
  pubKeyfromPrivKey,
} from "@stacks/transactions";
import { useMutation } from "@tanstack/vue-query";
import { BitcoinNetworkType } from "sats-connect";
import { apiClient } from "../api/client";
import { network } from "../constants/bitcoin";
import { createToken, useAuthStore } from "@repo/auth-utils";
import { WalletType } from "@repo/wallet-utils/src/checkWallets";
import {
  getAddressesLeather,
  getAddressesUnisat,
  getAddressesXverse,
  // getAddressesXverse,
  signBip322Leather,
  signBip322Unisat,
  signBip322Xverse,
} from "@repo/wallet-utils";
// DONE: add support for leather wallet and unisat wallet

const getAddressesByWalletType = {
  [WalletType.leather]: getAddressesLeather,
  [WalletType.xverse]: getAddressesXverse,
  [WalletType.unisat]: getAddressesUnisat,
};
const getAddresses = ({
  message,
  networkType,
  walletType,
}: {
  walletType: WalletType;
  networkType: BitcoinNetworkType;
  message: string;
}) => {
  const fn = getAddressesByWalletType[walletType];
  return fn({
    message,
    networkType,
  });
};

const signByWalletType = {
  [WalletType.unisat]: signBip322Unisat,
  [WalletType.leather]: signBip322Leather,
  [WalletType.xverse]: signBip322Xverse,
};

const signMessage = ({
  walletType,
  networkType,
  message,
  tapRootAddress,
}: {
  walletType: WalletType;
  networkType: BitcoinNetworkType;
  message: string;
  tapRootAddress: string;
}) => {
  const fn = signByWalletType[walletType];
  return fn({
    message,
    networkType,
    tapRootAddress,
  });
};

export function useAuth() {
  const auth = useAuthStore();

  const getAddressesMsg =
    "We need the address you'll use to pay for the service and the address where you want to receive the Ordinals.";
  const createSessionMut = useMutation({
    mutationKey: ["createSession"],
    mutationFn: async ({
      message,
      ordinalAddress,
      signature,
    }: {
      message: string;
      ordinalAddress: string;
      signature: string;
    }) => {
      const response = await apiClient.provide("post", "/login", {
        message,
        ordinalAddress,
        signature,
      });

      if (response.status !== "success") {
        throw new Error(response.error.message);
      }

      return response.data;
    },
  });

  const login = async ({ walletType }: { walletType: WalletType }) => {
    const { ordinalAddress, paymentAddress } = await getAddresses({
      message: getAddressesMsg,
      networkType: network,
      walletType,
    });
    const privateKey = privateKeyToString(makeRandomPrivKey());
    const publicKey = publicKeyToString(
      compressPublicKey(pubKeyfromPrivKey(privateKey).data),
    );
    const message = import.meta.env.VITE_APP_AUTH_MESSAGE_PREFIX + publicKey;
    const signature = await signMessage({
      message,
      networkType: network,
      tapRootAddress: ordinalAddress,
      walletType,
    });

    await createSessionMut.mutateAsync({
      message,
      ordinalAddress,
      signature,
    });
    auth.setAddresses({
      ordinalAddress,
      paymentAddress,
    });

    auth.setPrivateKey(privateKey);

    return {
      privateKey,
      paymentAddress,
      ordinalAddress,
    };
  };
  return {
    login,
    auth,
  };
}

export const createAppToken = (privateKey: string) => {
  return createToken({
    privateKey,
    prefix: import.meta.env.VITE_APP_CHALLENGE_TEXT,
  });
};
