import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./pages/Home.vue"!),
  },
  {
    path: "/miami",
    name: "Miami",
    component: () => import("./pages/Miami.vue"!),
  },
  {
    path: "/gallery",
    name: "Gallery",
    component: () => import("./pages/Gallery.vue"!)
  }
];

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
});

export default router;
