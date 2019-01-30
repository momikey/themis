import Vue from "vue";
import VueRouter from "vue-router";

import FrontPage from "./components/FrontPage.vue";
import WebFrontend from "./components/WebFrontend.vue";
import AdminControlPanel from "./components/AdminControlPanel.vue";
import SettingsPanel from "./components/SettingsPanel.vue";

Vue.use(VueRouter);

let router = new VueRouter({
    routes: [
        {
            path: '/',
            component: FrontPage,
            name: 'front'
        },
        {
            path: '/web',
            component: WebFrontend,
            name: 'main'
        },
        {
            path: '/admin',
            component: AdminControlPanel,
            name: 'admin'
        },
        {
            path: '/settings',
            component: SettingsPanel,
            name: 'settings',
            children: [
                {
                    path: 'profile'
                },
                {
                    path: 'preferences'
                },
                {
                    path: 'filters'
                },
                {
                    path: 'exit',
                    redirect: { name: 'main' }
                }
            ]
        }
    ]
});

export default router;