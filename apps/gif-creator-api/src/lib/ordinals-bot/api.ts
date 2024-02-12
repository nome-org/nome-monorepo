import { Inscription } from "ordinalsbot";
export const OBInscriptionApi = new Inscription(
    process.env.ORDINALS_BOT_API_KEY,
    process.env.NODE_ENV === "development" ? "dev" : "live",
);
