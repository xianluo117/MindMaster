import { createRouter, createWebHistory } from "vue-router";
import IndexView from "@/pages/Index/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Index",
      component: IndexView,
    },
    {
      path: "/mind-master",
      name: "MindMaster",
      component: () => import("@/pages/Edit/index.vue"),
    },
  ],
});

export default router;
