import {
  compressPublicKey,
  pubKeyfromPrivKey,
  publicKeyToString,
} from "@stacks/transactions";
import { addMinutes } from "date-fns";
import { TokenSigner } from "jsontokens";

export const publicKeyFromPrivateKey = (privKey: string) => {
  return publicKeyToString(compressPublicKey(pubKeyfromPrivKey(privKey).data));
};

export const createToken = ({
  privateKey,
  prefix,
}: {
  privateKey: string;
  prefix: string;
}) => {
  const currentDate = new Date();
  const salt = `${prefix}${currentDate.toISOString()}`;
  const tokenPayload = {
    iss: publicKeyFromPrivateKey(privateKey),
    exp: addMinutes(currentDate, 5).getTime() / 1000,
    iat: currentDate.getTime() / 1000,
    salt,
  };
  return new TokenSigner("ES256K", privateKey).sign(tokenPayload);
};
