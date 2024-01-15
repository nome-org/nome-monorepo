import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const STORE_KEY = "auth";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return useLocalStorage(STORE_KEY, {
      privateKey: "",
      paymentAddress: "",
      ordinalAddress: "",
    });
  },
  actions: {
    setAddresses({
      paymentAddress,
      ordinalAddress,
    }: {
      paymentAddress: string;
      ordinalAddress: string;
    }) {
      this.paymentAddress = paymentAddress;
      this.ordinalAddress = ordinalAddress;
    },

    setPrivateKey(privateKey: string) {
      this.privateKey = privateKey;
    },

    logout() {
      this.privateKey = "";
    },
  },
  getters: {
    isLoggedIn: (state) => {
      return Boolean(
        state.privateKey && state.paymentAddress && state.ordinalAddress,
      );
    },
  },
});
