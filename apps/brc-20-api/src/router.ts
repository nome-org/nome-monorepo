import { Routing, defaultEndpointsFactory } from "express-zod-api";
import { checkClaimEndpoint } from "./routes/check-claim";
import z from "zod";

export const routing: Routing = {
  "/": defaultEndpointsFactory.build({
    method: "get",
    handler: async () => {
      return {
        message: "I am alive! or am I?",
      };
    },
    input: z.object({}),
    output: z.object({ message: z.string() }),
  }),
  "/check-claim": checkClaimEndpoint,
};
