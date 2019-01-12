import Vue from "vue";
import VueRouter from "vue-router";

import FrontPage from "./components/FrontPage.vue";
import WebFrontend from "./components/WebFrontend.vue";
import AdminControlPanel from "./components/AdminControlPanel.vue";

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
        },
        {
            path: '/admin',
            component: AdminControlPanel
        }
    ]
});

export default router;