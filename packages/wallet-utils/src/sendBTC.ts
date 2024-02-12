import { RpcError, SendTransferResponseBody } from "@btckit/types";
import { BitcoinNetworkType, sendBtcTransaction } from "sats-connect";
import { getLeatherBTCProvider } from "./util/btc-provider";
import { AppNetworkType } from "./util/types";

type Payload = {
  recipient: string;
  amountInSats: number;
  network: AppNetworkType;
  /** required by xverse */
  senderAddress: string;
  /** optional message just for xverse as well */
  message?: string;
};

export async function sendBTCUnisat({
  amountInSats,
  recipient,
}: Payload): Promise<string> {
  const unisat = (window as unknown as any).unisat;
  if (!unisat) {
    throw new Error("Unisat not found");
  }
  return unisat.sendBitcoin(recipient, amountInSats);
}

export async function sendBTCLeather({
  amountInSats,
  recipient,
}: Payload): Promise<string> {
  const btc = getLeatherBTCProvider();
  const response = (await btc.request("sendTransfer", {
    address: recipient,
    amount: amountInSats,
  })) as unknown as any;
  const error = response.error as RpcError | undefined;
  if (error) {
    throw new Error(error.message);
  }

  const result = response.result as SendTransferResponseBody;
  return result.txid;
}

export async function sendBTCXverse({
  amountInSats,
  recipient,
  senderAddress,
  network,
}: Payload): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    sendBtcTransaction({
      payload: {
        network: {
          type:
            network === "mainnet"
              ? BitcoinNetworkType.Mainnet
              : BitcoinNetworkType.Testnet,
        },
        recipients: [
          {
            address: recipient,
            amountSats: BigInt(amountInSats),
          },
        ],
        senderAddress,
      },
      onFinish: resolve,
      onCancel: reject,
    });
  });
}
