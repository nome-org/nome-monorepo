type GetOrdersInput = {
    address: string;
    page?: number;
}

type GetOrdersResponse = {
    status: "success";
    data: {
        data: {
            receiver_address: string;
            created_at: string;
            id: number;
            updated_at: string;
            status: "UNPAID" | "PAYMENT_PENDING" | "IMAGE_ORDINALS_PENDING" | "HTML_ORDINALS_PENDING" | "READY";
            quantity: number;
            total_fee: number;
            payment_tx_id: string | null;
            payment_details: {
                address: string;
                amount: number;
            };
        }[];
        total: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type PostOrdersInput = {
    files: {
        name: string;
        size: number;
        dataURL: string;
        duration: number;
        type: string;
    }[];
    rarity?: "block78" | "pizza" | "uncommon" | "black" | "vintage" | "random";
    receiverAddress: string;
    quantity?: number;
    feeRate: number;
}

type PostOrdersResponse = {
    status: "success";
    data: {
        id: number;
        payment_details: {
            address: string;
            amount: number;
        };
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type PostOrdersTokenInput = {
    id: string;
    index: number;
    file: {
        size: number;
        type: string;
        name: string;
        url: string;
        s3Key: string;
        iqueued: boolean;
        iqueuedAt: number;
    };
    tx: {
        inscription: string;
    };
} & {
    token: string;
}

type PostOrdersTokenResponse = {
    status: "success";
    data: {
        id: string;
        success: boolean;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type GetPriceInput = {
    imageSizes: string[];
    fee_rate: string;
    count?: string;
    rareSats?: "block78" | "pizza" | "uncommon" | "black" | "vintage" | "random";
}

type GetPriceResponse = {
    status: "success";
    data: {
        totalFee: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

type PostLoginInput = {
    ordinalAddress: string;
    signature: string;
    message: string;
}

type PostLoginResponse = {
    status: "success";
    data: {
        id: number;
    };
} | {
    status: "error";
    error: {
        message: string;
    };
}

export type Path = "/orders" | "/orders" | "/orders/:token" | "/price" | "/login"

export type Method = "get" | "post" | "put" | "delete" | "patch"

export type MethodPath = `${Method} ${Path}`

export interface Input extends Record<MethodPath, any> {
    "get /orders": GetOrdersInput;
    "post /orders": PostOrdersInput;
    "post /orders/:token": PostOrdersTokenInput;
    "get /price": GetPriceInput;
    "post /login": PostLoginInput;
}

export interface Response extends Record<MethodPath, any> {
    "get /orders": GetOrdersResponse;
    "post /orders": PostOrdersResponse;
    "post /orders/:token": PostOrdersTokenResponse;
    "get /price": GetPriceResponse;
    "post /login": PostLoginResponse;
}