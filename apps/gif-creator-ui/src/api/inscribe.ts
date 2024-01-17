import { apiClient } from "./client.ts";

interface FileData {
  size: number;
  type: string;
  name: string;
  dataURL: string;
  duration: number;
}

interface InscribeParams {
  files: FileData[];
  rarity: "block78" | "pizza" | "uncommon" | "black" | "vintage" | "random";
  receiverAddress: string;
  quantity: number;
  feeRate: number;
  token: string;
}

export const inscribeApi = async ({
  files,
  rarity,
  receiverAddress,
  feeRate,
  quantity,
  token,
}: InscribeParams) => {
  return apiClient.provide(
    "post",
    "/orders",
    {
      files,
      rarity,
      receiverAddress,
      feeRate,
      quantity,
    },
    {
      Authorization: `Bearer ${token}`,
    },
  );
};
