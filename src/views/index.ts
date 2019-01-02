import Vue from "vue";
import VueRouter from "vue-router";
import VueWarehouse from "vue-warehouse";

import ThemisFrontPage from './components/FrontPage.vue';
import WebFrontend from './components/WebFrontend.vue';

import "vuetify/dist/vuetify.min.css";
import "./stylus/main.styl";

Vue.use(VueRouter);

const routes = [
    { path: '/', component: ThemisFrontPage },
    { path: '/web', component: WebFrontend }
];

const router = new VueRouter({
    routes
});

Vue.use(require("vuetify"));

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    router,
    data: {
    },
    components: {
        ThemisFrontPage,
        WebFrontend
    },
    mounted () {
    }
});

v.$mount("#app");