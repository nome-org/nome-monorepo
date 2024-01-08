import { z } from "zod";
import { safeInt } from "./zod-extras";

export const ordinalsBotErrorResponseSchema = z.union([
    z.object({
        status: z.literal("error"),
        error: z.string(),
        reason: z.never(),
    }),
    z.object({
        status: z.literal("error"),
        error: z.never(),
        reason: z.string(),
    }),
]);

const createdAtSchema = z.object({
    ".sv": z.string(),
});

const lightningInvoiceSchema = z.object({
    expires_at: safeInt,
    payreq: z.string(),
});

const chainInvoiceSchema = z.object({
    address: z.string(),
});

const fileSchema = z.object({
    size: safeInt,
    type: z.string(),
    name: z.string(),
    url: z.string(),
    s3Key: z.string(),
});

const webhookFileSchema = fileSchema.extend({
    iqueued: z.boolean(),
    iqueuedAt: safeInt,
});

const txSchema = z.object({
    // commit: z.string(),
    // total_fees: safeInt,
    inscription: z.string(),
    // reveal: z.string(),
    // updatedAt: z.string(),
});

const chargeSchema = z.object({
    id: z.string(),
    description: z.string(),
    desc_hash: z.boolean(),
    created_at: safeInt,
    status: z.string(),
    amount: safeInt,
    callback_url: z.string().optional(),
    success_url: z.string().optional(),
    hosted_checkout_url: z.string(),
    order_id: z.string().optional(),
    currency: z.string(),
    source_fiat_value: safeInt,
    fiat_value: safeInt,
    auto_settle: z.boolean(),
    notif_email: z.string().optional(),
    address: z.string(),
    chain_invoice: chainInvoiceSchema,
    uri: z.string(),
    ttl: safeInt,
    lightning_invoice: lightningInvoiceSchema,
});

export const ordinalsBotWebhookPayloadSchema = z.object({
    id: z.string(),
    index: z.number().min(0),
    file: webhookFileSchema,
    tx: txSchema,
});

export const ordinalsBotCreateOrderResponseSchema = z.object({
    id: z.string(),
    files: z.array(fileSchema),
    lowPostage: z.boolean(),
    charge: chargeSchema,
    chainFee: safeInt,
    serviceFee: safeInt,
    fee: safeInt,
    baseFee: safeInt,
    rareSatsFee: safeInt,
    postage: safeInt,
    referral: z.string().optional(),
    rareSats: z.string(),
    receiveAddress: z.string(),
    webhookUrl: z.string(),
    status: z.literal("ok"),
    orderType: z.string(),
    state: z.string(),
    createdAt: createdAtSchema,
});

export type OrdinalsBotErrorResponse = z.infer<
    typeof ordinalsBotErrorResponseSchema
>;
export type OrdinalsBotCreateOrderResponse = z.infer<
    typeof ordinalsBotCreateOrderResponseSchema
>;
