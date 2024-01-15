import { apiClient } from "./client.ts";

export const getPriceApi = async ({
  imageSizes,
  fee,
  count = 1,
  rareSats = "random",
}: {
  imageSizes: number[];
  fee: number;
  count: number;
  rareSats: string;
}) => {
  return apiClient.provide("get", "/price", {
    fee_rate: String(fee),
    imageSizes: imageSizes.map(String),
    count: String(count),
    rareSats: rareSats as unknown as any,
  });
};
