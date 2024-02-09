import { getAddressByIndex } from "../payments/server-keys";
import { mempool } from "./mempool-client";

export const getUTXOsByIndex = async ({
    keyIndex,
    accountIndex,
    isTaproot,
}: {
    accountIndex: number;
    keyIndex: number;
    isTaproot?: boolean;
}) => {
    const address = await getAddressByIndex({
        accountIndex,
        keyIndex,
        isTaproot,
    });
    return mempool.bitcoin.addresses.getAddressTxsUtxo({ address: address! });
};
