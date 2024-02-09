import { defaultEndpointsFactory } from "express-zod-api";
import z from "zod";
import prisma from "../lib/prisma-client";
import { getAddressByIndex } from "../lib/payments/server-keys";
import { safeInt, taprootAddress } from "../types/zod-extras";
import { authMiddleware } from "../middlewares/auth-mw";
import { DELEGATE_WALLET_INDEX } from "../constants/wallet-accounts";
// actual weight is around 170.5 padding is for safety
const INSCRIBE_WEIGHT = 200;
export const createBearMarketOrder = defaultEndpointsFactory
    .addMiddleware(authMiddleware)
    .build({
        method: "post",
        input: z.object({
            receiverAddress: taprootAddress,
            feeRate: safeInt
                .min(1)
                .max(1000, "No way brah too much fee monies"),
        }),
        output: z.object({
            id: safeInt,
            payment_details: z.object({
                address: z.string(),
                amount: safeInt,
            }),
        }),
        handler: async ({
            input: { receiverAddress, feeRate },
            options: {
                session: { ordinalAddress },
            },
        }) => {
            //send response to client

            const order = await prisma.delegateOrdinal.create({
                data: {
                    fee_rate: feeRate,
                    minter_address: ordinalAddress,
                    receiver_address: receiverAddress,
                    total_fee: feeRate * INSCRIBE_WEIGHT,
                },
            });
            return {
                id: order.id,
                payment_details: {
                    address: (await getAddressByIndex({
                        accountIndex: DELEGATE_WALLET_INDEX,
                        keyIndex: order.id,
                        isTaproot: true,
                    }))!,
                    amount: order.total_fee,
                },
            };
        },
    });
