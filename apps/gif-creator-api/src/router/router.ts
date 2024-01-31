import { DependsOnMethod, Routing, ServeStatic } from "express-zod-api";
import { getOrdersEndpoint } from "./orders";
import { getPriceEndpoint } from "./price";
import { createOrderEndpoint } from "./create-order";
import { updateOrderWebhook } from "./update-order-webhook";
import path from "path";
import { createSessionEndpoint } from "./create-session";
import { getFramesEndpoint } from "./frames";

export const routing: Routing = {
    orders: {
        "": new DependsOnMethod({
            get: getOrdersEndpoint,
            post: createOrderEndpoint,
        }),
        ":token": updateOrderWebhook,
    },
    price: getPriceEndpoint,
    login: createSessionEndpoint,
    frames: getFramesEndpoint,
    docs: new ServeStatic(path.resolve(__dirname, "../../docs")),
};
