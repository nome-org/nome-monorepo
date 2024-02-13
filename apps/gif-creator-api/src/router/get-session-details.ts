import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth-mw";
import z from "zod";

export const getSessionDetailsEndpoint = defaultEndpointsFactory
    .addMiddleware(authMiddleware)
    .build({
        method: "get",
        input: z.object({}),
        output: z.object({
            is_expired: z.boolean(),
            ordinal_address: z.string(),
            public_key: z.string(),
        }),
        handler: async ({ options: { session } }) => session,
    });
