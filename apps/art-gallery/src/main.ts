import { createApp } from "vue";
import {OhVueIcon, addIcons} from "oh-vue-icons";
import {FaVolumeUp, FaVolumeMute, BiChevronCompactUp, BiChevronCompactDown} from "oh-vue-icons/icons";

import "./style.css";
import App from "./App.vue";
import router from "./router.ts";


const icons = Object.values({FaVolumeUp, FaVolumeMute, BiChevronCompactUp, BiChevronCompactDown});
addIcons(...icons);

const app = createApp(App);

app.component("v-icon", OhVueIcon);

app.use(router).mount("#app");
