import { Verifier } from "bip322-js";
import { defaultEndpointsFactory } from "express-zod-api";
import createHttpError from "http-errors";
import z from "zod";
import prisma from "../lib/prisma-client";
import { validBTCAddress } from "@repo/shared-zod-defs";
import { isUserEligible } from "../lib/brc/isUserEligible";

const prefix = process.env.AUTH_MESSAGE_PREFIX!;
export const createSessionEndpoint = defaultEndpointsFactory.build({
    method: "post",
    input: z.object({
        ordinalAddress: validBTCAddress,
        signature: z.string().max(255),
        message: z
            .string()
            .startsWith(prefix, "Message must start with prefix")
            // 66 for public key
            .length(prefix.length + 66, "Message length invalid"),
    }),
    output: z.object({
        id: z.number(),
    }),
    handler: async ({ input: { signature, ordinalAddress, message } }) => {
        const validity = Verifier.verifySignature(
            ordinalAddress,
            message,
            signature,
        );

        if (!validity) {
            throw createHttpError(401, "Invalid signature");
        }

        const existingSession = await prisma.userSession.findFirst({
            where: {
                ordinal_address: ordinalAddress,
                public_key: message.replace(prefix, ""),
            },
        });

        if (existingSession) {
            throw createHttpError(409, "Session already exists");
        }

        const isEligible = await isUserEligible({ address: ordinalAddress });

        if (!isEligible) {
            throw createHttpError(403, "Insufficient $N0ME balance");
        }

        const publicKey = message.replace(prefix, "");
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    ordinal_address: ordinalAddress,
                },
            });
            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        ordinal_address: ordinalAddress,
                    },
                });
            }
            const session = await prisma.userSession.create({
                data: {
                    ordinal_address: ordinalAddress,
                    public_key: publicKey,
                },
            });

            return {
                id: session.id,
            };
        } catch (e) {
            throw createHttpError(400, "Invalid message");
        }
    },
});
