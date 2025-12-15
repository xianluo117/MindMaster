import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/Index/index.vue";
import EditPage from "@/pages/Edit/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Index",
      component: IndexPage,
    },
    {
      path: "/mind-master",
      name: "MindMaster",
      component: EditPage,
    },
  ],
});

export default router;
