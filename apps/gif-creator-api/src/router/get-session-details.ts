import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth-mw";
import z from "zod";

export const getSessionDetailsEndpoint = defaultEndpointsFactory
    .addMiddleware(authMiddleware)
    .build({
        method: "get",
        input: z.object({}),
        output: z.object({
            isExpired: z.boolean(),
            ordinalAddress: z.string(),
            publicKey: z.string(),
        }),
        handler: async ({ options: { session } }) => session,
    });
