import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth-mw";
import z from "zod";
import prisma from "../lib/prisma-client";
import { OrderStatus } from "@repo/gif-creator-db";

export const getFramesEndpoint = defaultEndpointsFactory
    .addMiddleware(authMiddleware)
    .build({
        method: "get",
        input: z.object({
            take: z.number().min(1).max(100).default(10),
            skip: z.number().min(0).safe().default(0),
        }),
        output: z.object({
            results: z.array(z.string()),
            total: z.number().int(),
        }),
        handler: async ({ input: { take, skip } }) => {
            const frames = await prisma.ordinal.findMany({
                where: {
                    image_files_order: {
                        status: OrderStatus.UNPAID,
                    },
                },
                distinct: ["hash"],
                take,
                skip,
                orderBy: {
                    created_at: "desc",
                },
            });
            return {
                results: frames.map(
                    (item) => `${item.tx_id}i${item.ordinal_index}`,
                ),
                total: 1,
            };
        },
    });
