import { AppNetworkType } from "@repo/wallet-utils";

export const network = import.meta.env.VITE_APP_NETWORK as AppNetworkType;
