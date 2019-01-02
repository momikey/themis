import Vue from "vue";
import VueRouter from "vue-router";
import VueWarehouse from "vue-warehouse";

import ThemisFrontPage from './components/FrontPage.vue';
import WebFrontend from './components/WebFrontend.vue';

import "vuetify/dist/vuetify.min.css";
import "./stylus/main.styl";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import router from "./router";

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