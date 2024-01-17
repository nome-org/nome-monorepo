import { Verifier } from "bip322-js";
import { defaultEndpointsFactory } from "express-zod-api";
import createHttpError from "http-errors";
import z from "zod";
import { checkUserBalance } from "../lib/brc/check-user-balance";
import { MIN_ELIGIBLE_BALANCE } from "../lib/constants";
import prisma from "../lib/prisma-client";
import { validTaprootAddress } from "@repo/shared-zod-defs";

const prefix = process.env.AUTH_MESSAGE_PREFIX!;
export const createSessionEndpoint = defaultEndpointsFactory.build({
    method: "post",
    input: z.object({
        ordinalAddress: validTaprootAddress,
        signature: z.string().max(100),
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
                ordinalAddress,
                publicKey: message.replace(prefix, ""),
            },
        });

        if (existingSession) {
            throw createHttpError(409, "Session already exists");
        }

        const {
            data: { availableBalance },
        } = await checkUserBalance({ address: ordinalAddress });

        if (Number(availableBalance) < MIN_ELIGIBLE_BALANCE) {
            throw createHttpError(403, "Insufficient balance");
        }

        const publicKey = message.replace(prefix, "");
        try {
            const session = await prisma.userSession.create({
                data: {
                    ordinalAddress,
                    publicKey,
                },
            });

            return session;
        } catch (e) {
            throw createHttpError(400, "Invalid message");
        }
    },
});