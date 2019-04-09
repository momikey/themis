import Vue from "vue";
import VueRouter from 'vue-router';

import FrontPage from "./components/FrontPage.vue";

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: FrontPage,
            name: 'Front'
        },
    ]
});

export default router;