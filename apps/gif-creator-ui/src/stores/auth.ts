import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const STORE_KEY = "auth";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return useLocalStorage(STORE_KEY, {
      paymentAddress: "",
      ordinalsAddress: "",
    });
  },
  actions: {
    /**
     *
     * @param {{paymentAddress: string, ordinalsAddress: string}} params
     */
    setAddresses({ paymentAddress, ordinalsAddress }) {
      this.paymentAddress = paymentAddress;
      this.ordinalsAddress = ordinalsAddress;
    },

    logout() {
      this.paymentAddress = "";
      this.ordinalsAddress = "";
    },
  },
});
