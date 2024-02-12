import { RpcError, SendTransferResponseBody } from "@btckit/types";
import { BitcoinNetworkType, sendBtcTransaction } from "sats-connect";

type Payload = {
  recipient: string;
  amountInSats: number;
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
  if (!window.btc) {
    throw new Error("Bitcoin wallet not connected");
  }
  const response = (await window.btc.request("sendTransfer", {
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
}: Payload): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    sendBtcTransaction({
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
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
