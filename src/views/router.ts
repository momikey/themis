import Vue from "vue";
import VueRouter from "vue-router";

import FrontPage from "./components/FrontPage.vue";
import WebFrontend from "./components/WebFrontend.vue";

Vue.use(VueRouter);

let router = new VueRouter({
    routes: [
        {
            path: '/',
            component: FrontPage
        },
        {
            path: '/web',
            component: WebFrontend
        }
    ]
});

export default router;