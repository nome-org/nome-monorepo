import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import { networkMode } from "./network";

export const getAddressByIndex = async ({
    accountIndex,
    keyIndex,
    isTaproot,
}: {
    accountIndex: number;
    keyIndex: number;
    isTaproot?: boolean;
}) => {
    const key = getKeyByIndex({ keyIndex, accountIndex, isTaproot });
    const btcSigner = await import("@scure/btc-signer");
    return btcSigner.getAddress(
        isTaproot ? "tr" : "wpkh",
        key.privateKey!,
        networkMode,
    );
};

const getHDKey = () => {
    const mnemonic = process.env.PAYMENT_MNEMONIC!;

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return HDKey.fromMasterSeed(seed);
};

const getDerivationPath = (keyIndex: number, taproot?: boolean) => {
    let accountIndex = 0;
    if (keyIndex > 209_496_7296) {
        accountIndex = Math.floor(keyIndex / 209_496_7296);
    }

    const version = taproot ? 86 : 84;
    const separator = "'/";
    const endQuote = "'";
    const path = [
        "m/",
        version,
        separator,
        0,
        separator,
        accountIndex,
        endQuote,
    ];
    return path.join("");
};

export const getKeyByIndex = ({
    accountIndex,
    keyIndex,
    isTaproot,
}: {
    accountIndex: number;
    keyIndex: number;
    isTaproot?: boolean;
}) => {
    const hdKey = getHDKey();
    const derivationPath = getDerivationPath(keyIndex, isTaproot);
    return hdKey
        .derive(derivationPath)
        .deriveChild(accountIndex)
        .deriveChild(keyIndex);
};
