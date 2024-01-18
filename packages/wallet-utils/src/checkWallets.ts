import { getProviderOrThrow } from "sats-connect";

const checkXverseProvider = async () => {
  try {
    await getProviderOrThrow();
    return true;
  } catch (e) {
    return false;
  }
};
export enum WalletType {
  xverse = "xverse",
  unisat = "unisat",
  leather = "leather",
}
export const checkAvailableWallets: () => Promise<{
  [key in WalletType]: boolean;
}> = async () => {
  const isLeather = !!window.btc;
  const isUnisat = !!(window as any).unisat;
  const isXverse = await checkXverseProvider();

  return {
    leather: isLeather,
    unisat: isUnisat,
    xverse: isXverse,
  };
};
