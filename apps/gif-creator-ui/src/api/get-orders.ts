// interface HTMLTransaction {
//   id: number;
//   created_at: string;
//   updated_at: string;
//   tx_id: string;
//   status: "PENDING" | "CONFIRMED";
// }

export interface OrderWithStatus {
  id: number;
  created_at: string;
  updated_at: string;
  ordinals_bot_order_id: string | null;
  receiver_address: string;
  html_transaction_id: number | null;
  html_inscription_index: number | null;
  payment_tx_id: string | null;
  status: "UNPAID" | "PENDING" | "READY";
}

import { apiClient } from "./client.ts";

export const getOrdersApi = async (address: string) => {
  return apiClient.provide("get", "/orders", { address });
};
