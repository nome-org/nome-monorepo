import { TokenInterface, TokenVerifier, decodeToken } from "jsontokens";

interface AuthJWTInterface extends TokenInterface {
  payload: {
    iss: string;
    salt: string;
  };
}

const validateSalt = ({ prefix, salt }: { salt: string; prefix: string }) => {
  if (!salt.startsWith(prefix)) {
    return false;
  }

  const saltDateISOString = salt.replace(prefix, "");

  const saltDate = new Date(saltDateISOString);

  if (saltDate.toString() === "Invalid Date") {
    return false;
  }

  const now = new Date();

  const diff = now.getTime() - saltDate.getTime();

  const diffInMinutes = Math.round(diff / 60000);

  if (diffInMinutes > 5 || diffInMinutes < -5) {
    return false;
  }

  return true;
};

export const verifyToken = ({
  token,
  prefix,
}: {
  token: string;
  prefix: string;
}) => {
  try {
    const decoded = decodeToken(token) as AuthJWTInterface;

    if (!decoded || typeof decoded.payload !== "object") {
      throw new Error("Invalid auth!");
    }
    const pubKey = decoded.payload.iss;
    const salt = decoded.payload.salt;

    if (
      !validateSalt({
        salt,
        prefix,
      })
    ) {
      throw new Error("Invalid auth!");
    }

    if (!pubKey || !salt) {
      throw new Error("Invalid auth!");
    }

    const verified = new TokenVerifier("ES256K", pubKey).verify(token);

    if (!verified) {
      throw new Error("Invalid auth!");
    }

    return decoded;
  } catch (err) {
    throw new Error("Invalid auth!");
  }
};
