import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

const STORE_KEY = "auth";
type State = {
  privateKey: string;
  paymentAddress: string;
  ordinalAddress: string;
};
export const useAuthStore = defineStore<
  typeof STORE_KEY,
  State,
  {
    isLoggedIn: (state: State) => boolean;
  },
  {
    setAddresses: ({
      paymentAddress,
      ordinalAddress,
    }: {
      paymentAddress: string;
      ordinalAddress: string;
    }) => void;
    setPrivateKey: (privateKey: string) => void;
    logout: () => void;
  }
>("auth", {
  state: () => {
    return useLocalStorage(STORE_KEY, {
      privateKey: "",
      paymentAddress: "",
      ordinalAddress: "",
    }).value;
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
        // state.privateKey &&
        state.paymentAddress && state.ordinalAddress
      );
    },
  },
});
