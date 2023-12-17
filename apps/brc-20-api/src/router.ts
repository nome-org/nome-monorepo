import { Routing, defaultEndpointsFactory } from "express-zod-api"
import { checkClaimEndpoint } from "./routes/check-claim.js"
import z from "zod"
import { getPriceEndpoint } from "./routes/get-price.js"

export const routing: Routing = {
  "": defaultEndpointsFactory.build({
    method: "get",
    shortDescription: "Server Status",
    description: "Check if the server is alive",
    handler: async () => {
      return {
        message: "I am alive! or am I?",
      }
    },
    input: z.object({}),
    output: z.object({ message: z.string() }),
  }),
  "check-claim": checkClaimEndpoint,
  price: getPriceEndpoint,
}
