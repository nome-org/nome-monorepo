import { defaultEndpointsFactory } from "express-zod-api";
import { available_rarity } from "../constants/rarity";
import z from "zod";
import { calculatePrice } from "../lib/calculatePrice";
import { safeInt } from "../types/zod-extras";
import { mempool } from "../lib/mempool/mempool-client";

export const getPriceEndpoint = defaultEndpointsFactory.build({
    method: "get",
    input: z.object({
        imageSizes: z.array(
            z
                .string()
                .transform(Number)
                .refine((x) => x > 0)
        ),
        fee_rate: z
            .string({ description: "fee rate in sat/vbyte, currently ignored" })
            .transform(Number)
            .refine((x) => x > 0),
        count: z
            .string()
            .default("1")
            .transform(Number)
            .refine((x) => x > 0),
        rareSats: z.enum(available_rarity).default("random"),
    }),
    output: z.object({
        totalFee: safeInt,
    }),
    handler: async ({ input: { imageSizes, count, rareSats } }) => {
        const { fastestFee } = await mempool.bitcoin.fees.getFeesRecommended();
        const feeDetails = await calculatePrice({
            fee: fastestFee,
            imageFileSizes: imageSizes,
            quantity: count,
            rareSats,
        });
        return {
            totalFee: feeDetails.totalFee,
        };
    },
});
