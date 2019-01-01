import Vue from "vue";
import Vuetify from "vuetify";
import ThemisFrontPage from './components/FrontPage.vue';
import VueWarehouse from "vue-warehouse";

import "vuetify/dist/vuetify.min.css";

Vue.use(require("vuetify"));

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    el: "#app",
    template: `<v-app dark><themis-front-page class="themis-front-page" app/></v-app>`,
    data: {
    },
    components: {
        ThemisFrontPage
    },
    mounted () {
    }
});