import { createToken } from "@repo/auth-utils";
import { useQuery } from "@tanstack/vue-query";

import { apiClient } from "../api/client";
import { useAuth } from "./useAuth";
import { computed } from "vue";

export function useIsSessionValid() {
  const { auth } = useAuth();

  const privateKey = computed(() => auth.privateKey);
  const { data: isSessionValid } = useQuery({
    queryKey: ["session", privateKey],
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

      const isSessionValid = !data.data.is_expired;
      return isSessionValid;
    },
    enabled: () => !!auth.privateKey,
  });

  return computed(() => !!isSessionValid.value);
}
