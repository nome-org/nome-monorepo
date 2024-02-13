import { z } from "zod";
import createHttpError from "http-errors";
import { createMiddleware } from "express-zod-api";
import prisma from "../lib/prisma-client";

import { verifyToken } from "@repo/auth-utils";
import { isUserEligible } from "../lib/brc/isUserEligible";

const prefix = process.env.CHALLENGE_TEXT!;
// TODO: Check session valid through brc20 token amount

export const authMiddleware = createMiddleware({
    security: {
        // this information is optional and used for generating documentation
        and: [{ type: "header", name: "Authorization" }],
    },
    input: z.object({}),
    middleware: async ({ request }) => {
        const { headers } = request;
        const { authorization } = headers;

        if (!authorization) {
            throw createHttpError(401, "Invalid Auth");
        }

        const token = authorization.replace("Bearer ", "");

        try {
            const {
                payload: { iss: publicKey },
            } = verifyToken({
                prefix,
                token,
            });

            let session = await prisma.userSession.findUnique({
                where: {
                    public_key: publicKey,
                    is_expired: false,
                },
            });

            if (!session) {
                throw createHttpError(401, "No session, log in first!");
            }
            const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
            if (session.last_checked_at < sevenDaysAgo) {
                const is_expired = !(await isUserEligible({
                    address: session.ordinal_address,
                }));
                // just to avoid a noop update
                if (is_expired) {
                    session = await prisma.userSession.update({
                        where: {
                            id: session.id,
                        },
                        data: {
                            last_checked_at: new Date(),
                            is_expired,
                        },
                    });
                }
            }

            if (session.is_expired) {
                throw createHttpError(401, "Session Expired");
            }

            return { session };
        } catch (error) {
            throw createHttpError(401, "Invalid Auth");
        }
    },
});
