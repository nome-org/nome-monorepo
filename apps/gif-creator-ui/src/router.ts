import { useAuthStore } from "@repo/auth-utils";
import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
const brcGuard = () => {
  const auth = useAuthStore();
  if (!auth.isLoggedIn) {
    return {
      name: "Intro",
    };
  }
};
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("./pages/Home.vue"),
  },
  {
    path: "/mint",
    name: "Bear Market",
    component: () => import("./pages/gallery/Miami.vue"),
  },
  {
    path: "/gallery",
    name: "Gallery",
    component: () => import("./pages/gallery/Gallery.vue"),
    beforeEnter: brcGuard,
  },
  {
    path: "/intro",
    name: "Intro",
    component: () => import("./pages/Intro.vue"),
  },
  {
    path: "/gif",
    name: "GIFTool",
    component: () => import("./pages/GIFTool.vue"),
    beforeEnter: brcGuard,
  },
  {
    path: "/member",
    name: "Member",
    component: () => import("./pages/Member.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
});

export default router;
