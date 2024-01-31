import { getBRC20Balance } from "@repo/unisat-api";
import { MIN_ELIGIBLE_BALANCE } from "../constants";

export async function isUserEligible({ address }: { address: string }) {
    const {
        data: { availableBalance },
    } = await getBRC20Balance({
        address,
        ticker: process.env.NOME_BRC20_TICKER!,
        apiKey: process.env.UNISAT_API_KEY!,
    });

    return Number(availableBalance) >= MIN_ELIGIBLE_BALANCE;
}
