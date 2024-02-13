import { createToken } from "@repo/auth-utils";
import { useQuery } from "@tanstack/vue-query";

import { apiClient } from "../api/client";
import { useAuth } from "./useAuth";

export function useIsSessionValid() {
  const { auth } = useAuth();

  const { data: isSessionValid } = useQuery({
    queryKey: ["session", auth.privateKey],
    queryFn: async () => {
      const token = createToken({
        privateKey: auth.privateKey,
        prefix: import.meta.env.VITE_APP_CHALLENGE_TEXT,
      });

      const data = await apiClient.provide(
        "get",
        "/session",
        {},
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (data.status === "error") {
        return false;
      }

      const isSessionValid = !data.data.isExpired;
      return isSessionValid;
    },
    enabled: () => !!auth.privateKey,
  });

  return !!isSessionValid;
}
