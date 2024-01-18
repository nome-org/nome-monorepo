import { RpcError } from "@btckit/types";
import { SignMessageResponseBody } from "@btckit/types/dist/types/methods/sign-message";
import {
  BitcoinNetworkType,
  signMessage as xverseSignMessage,
} from "sats-connect";
export function signBip322Xverse({
  networkType,
  tapRootAddress,
  message,
}: {
  networkType: BitcoinNetworkType;
  tapRootAddress: string;
  message: string;
}) {
  return new Promise<string>((resolve, reject) => {
    xverseSignMessage({
      onCancel: reject,
      onFinish: resolve,
      payload: {
        network: {
          type: networkType,
        },
        address: tapRootAddress,
        message,
      },
    });
  });
}

export async function signBip322Leather({ message }: { message: string }) {
  if (!window.btc) {
    throw new Error("Bitcoin wallet not connected");
  }
  const response = (await window.btc.request("signMessage", {
    message,
    paymentType: "p2tr",
  })) as unknown as any;
  const error = response.error as RpcError | undefined;
  if (error) {
    throw new Error(error.message);
  }

  const { signature } = response.result as SignMessageResponseBody;
  return signature;
}

export async function signBip322Unisat({ message }: { message: string }) {
  const unisat = (window as any).unisat;
  if (!unisat) {
    throw new Error("Bitcoin wallet not connected");
  }
  const signature = await unisat.signMessage(message, "bip322-simple");
  return signature as string;
}
