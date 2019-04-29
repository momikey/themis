import Vue from "vue";
import VueRouter from 'vue-router';

import FrontPage from "./components/FrontPage.vue";
import ClientContainer from "./components/ClientContainer.vue";
import LogoutTransition from "./components/LogoutTransition.vue";

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: FrontPage,
            name: 'front'
        },
        {
            path: '/web',
            component: ClientContainer,
            name: 'client'
        },
        {
            path: '/logout',
            component: LogoutTransition,
            name: 'logout'
        },
    ]
});

export default router;