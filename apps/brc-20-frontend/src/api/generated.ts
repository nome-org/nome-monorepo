type GetInput = {}

type GetResponse = {
    status: "success";
    data: {
        message: string;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type GetCheckClaimInput = {
    address: string;
}

type GetCheckClaimResponse = {
    status: "success";
    data: {
        freeAmount: number;
        isWhitelistOpen: boolean;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type GetPriceInput = {
    amount: string;
    feeRate: string;
    address: string;
}

type GetPriceResponse = {
    status: "success";
    data: {
        brc20Price: number;
        minerFees: number;
        basePostage: number;
        total: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type PostOrdersInput = {} & {
    receiveAddress: string;
    amount: number;
    feeRate: number;
}

type PostOrdersResponse = {
    status: "success";
    data: {
        id: number;
        paymentAddress: string;
        receiveAddress: string;
        createdAt: string;
        updatedAt: string;
        totalPrice: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type GetOrdersIdInput = {
    id: string;
}

type GetOrdersIdResponse = {
    status: "success";
    data: {
        id: number;
        status: "UNPAID" | "EXPIRED" | "COMPLETE";
        amount: number;
        feeRate: number;
        createdAt: string;
        updatedAt: string;
        paymentAddress: string;
        paymentTxId: string | null;
        transferTxId: string | null;
        receiveAddress: string;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

export type Path = "" | "/check-claim" | "/price" | "/orders" | "/orders/:id"

export type Method = "get" | "post" | "put" | "delete" | "patch"

export type MethodPath = `${Method} ${Path}`

export interface Input extends Record<MethodPath, any> {
    "get ": GetInput;
    "get /check-claim": GetCheckClaimInput;
    "get /price": GetPriceInput;
    "post /orders": PostOrdersInput;
    "get /orders/:id": GetOrdersIdInput;
}

export interface Response extends Record<MethodPath, any> {
    "get ": GetResponse;
    "get /check-claim": GetCheckClaimResponse;
    "get /price": GetPriceResponse;
    "post /orders": PostOrdersResponse;
    "get /orders/:id": GetOrdersIdResponse;
}

export const jsonEndpoints = { "get ": true, "get /check-claim": true, "get /price": true, "post /orders": true, "get /orders/:id": true }

export const endpointTags = { "get ": [], "get /check-claim": [], "get /price": [], "post /orders": [], "get /orders/:id": [] }

export type Provider = <M extends Method, P extends Path>(method: M, path: P, params: Input[`${M} ${P}`]) => Promise<Response[`${M} ${P}`]>

export type Implementation = (method: Method, path: string, params: Record<string, any>) => Promise<any>

export class ExpressZodAPIClient {
    constructor(protected readonly implementation: Implementation) { }
    public readonly provide: Provider = async (method, path, params) => this.implementation(method, Object.keys(params).reduce((acc, key) => acc.replace(`:${key}`, params[key]), path), Object.keys(params).reduce((acc, key) => path.indexOf(`:${key}`) >= 0 ? acc : { ...acc, [key]: params[key] }, {}));
}