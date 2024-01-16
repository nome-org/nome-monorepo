import {
  privateKeyToString,
  makeRandomPrivKey,
  publicKeyToString,
  compressPublicKey,
  pubKeyfromPrivKey,
} from "@stacks/transactions";
import { useMutation } from "@tanstack/vue-query";
import { getAddress, AddressPurpose, signMessage } from "sats-connect";
import { apiClient } from "../api/client";
import { network } from "../constants/bitcoin";
import { getWalletAddresses } from "./getWalletAddresses";
import { useAuthStore } from "@repo/auth-utils";

export function useAuth() {
  const auth = useAuthStore();
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

  const login = () => {
    return new Promise<{
      privateKey: string;
      ordinalAddress: string;
      paymentAddress: string;
    }>((resolve, reject) => {
      getAddress({
        payload: {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          message:
            "We need the address you'll use to pay for the service, and the address where you want to receive the Ordinals.",
          network: {
            type: network,
          },
        },
        onFinish: async (response) => {
          const { ordinalAddress, paymentAddress } =
            getWalletAddresses(response);
          const privateKey = privateKeyToString(makeRandomPrivKey());
          const publicKey = publicKeyToString(
            compressPublicKey(pubKeyfromPrivKey(privateKey).data),
          );
          const message =
            import.meta.env.VITE_APP_AUTH_MESSAGE_PREFIX + publicKey;
          signMessage({
            payload: {
              address: ordinalAddress,
              message,
              network: {
                type: network,
              },
            },
            async onFinish(signature) {
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
              resolve({
                privateKey,
                paymentAddress,
                ordinalAddress,
              });
            },
            onCancel() {
              reject("User refused to sign");
            },
          });
        },
        onCancel() {
          reject("User refused to provide addresses");
        },
      });
    });
  };
  return {
    login,
    auth,
  };
}
