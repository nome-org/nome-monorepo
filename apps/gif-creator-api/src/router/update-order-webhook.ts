import { defaultEndpointsFactory } from "express-zod-api";
import ErrorResponse from "../lib/error-response";
import prisma from "../lib/prisma-client";
import z from "zod";
import { ordinalsBotWebhookPayloadSchema } from "../types/ordinals-bot";

export const updateOrderWebhook = defaultEndpointsFactory.build({
    method: "post",
    input: z.intersection(
        ordinalsBotWebhookPayloadSchema,
        z.object({
            token: z.string(),
        })
    ),
    output: z.object({
        id: z.string(),
        success: z.boolean(),
    }),
    handler: async ({ input: { id, token, file, tx } }) => {
        //once it gets here

        if (!token) {
            throw new ErrorResponse("Invalid order token", 401);
        }

        const existingFile = await prisma.ordinal.findFirst({
            where: {
                name: file.name,
                ordinals_bot_order_id: id,
                OR: [
                    {
                        image_files_order: {
                            update_token: token,
                        },
                    },
                    {
                        html_files_order: {
                            update_token: token,
                        },
                    },
                ],
            },
        });

        if (!existingFile) {
            throw new ErrorResponse("Invalid order token", 401);
        }

        if (existingFile.tx_id) {
            throw new ErrorResponse("Order already inscribed", 400);
        }

        const [tx_id, ordinal_index] = tx.inscription.split("i");
        await prisma.ordinal.update({
            where: {
                id: existingFile.id,
            },
            data: {
                tx_id,
                ordinal_index: Number(ordinal_index),
            },
        });

        return {
            id,
            success: true,
        };

        //inscribe the html file with the id
    },
});
