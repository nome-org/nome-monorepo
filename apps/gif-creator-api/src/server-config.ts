import { createConfig } from "express-zod-api";
const PORT = Number(process.env.PORT || 3000);
export const config = createConfig({
    server: {
        listen: PORT,
        compression: true,
    },
    cors: ({ defaultHeaders }) => ({
        ...defaultHeaders,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }),
    logger: {
        level: "debug",
        color: true,
    },
    startupLogo: process.env.NODE_ENV === "production",
});
