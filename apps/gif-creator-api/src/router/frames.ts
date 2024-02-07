import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth-mw";
import z from "zod";
import prisma from "../lib/prisma-client";
import { TransactionStatus } from "@repo/gif-creator-db";

export const getFramesEndpoint = defaultEndpointsFactory
    .addMiddleware(authMiddleware)
    .build({
        method: "get",
        input: z.object({
            take: z.coerce.number().min(1).max(100).default(10),
            skip: z.coerce.number().min(0).safe().default(0),
        }),
        output: z.object({
            results: z.array(z.string()),
            total: z.number().int(),
        }),
        handler: async ({ input: { take, skip } }) => {
            const frames = await prisma.ordinal.findMany({
                where: {
                    tx_status: TransactionStatus.CONFIRMED,
                    image_files_order: {
                        isNot: null,
                    },
                },
                distinct: ["hash"],
                take,
                skip,
                orderBy: {
                    created_at: "desc",
                },
            });
            const [{ total }] = await prisma.$queryRaw<[{ total: bigint }]>`
                SELECT COUNT(DISTINCT hash) as "total"
                FROM ordinal
                WHERE image_files_order_id IS NOT NULL
                AND tx_status = ${TransactionStatus.CONFIRMED}
                `;

            return {
                results: frames.map(
                    (item) => `${item.tx_id}i${item.ordinal_index}`,
                ),
                total: Number(total),
            };
        },
    });
