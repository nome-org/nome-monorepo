import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  FaVolumeUp,
  FaVolumeMute,
  BiChevronCompactUp,
  BiChevronCompactDown,
} from "oh-vue-icons/icons";

import "./style.css";
import App from "./App.vue";
import router from "./router";
addIcons(FaVolumeUp, FaVolumeMute, BiChevronCompactUp, BiChevronCompactDown);

createApp(App)
  .use(router)
  .use(VueQueryPlugin)
  .component("v-icon", OhVueIcon)
  .mount("#app");
