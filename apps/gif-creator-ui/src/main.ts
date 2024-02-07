import { createApp } from "vue";
import VueGtag from "vue-gtag";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  FaVolumeUp,
  FaVolumeMute,
  BiChevronCompactUp,
  BiChevronCompactDown,
  IoCloseOutline,
} from "oh-vue-icons/icons";

addIcons(
  FaVolumeUp,
  FaVolumeMute,
  BiChevronCompactUp,
  BiChevronCompactDown,
  IoCloseOutline,
);

import App from "./App.vue";
import router from "./router.ts";
import Vue3Toasity, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./global.css";

const pinia = createPinia();
const app = createApp(App);
app.component("v-icon", OhVueIcon);

app
  .use(VueGtag, {
    config: { id: "G-HZQ4TKL9G9" },
  })
  .use(Vue3Toasity, {
    autoClose: 3000,
  } as ToastContainerOptions)
  .use(pinia)
  .use(router as any)
  .use(VueQueryPlugin)
  .mount("#app");
