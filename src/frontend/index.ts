import Vue from "vue";
import VueWarehouse from "vue-warehouse";

// import ThemisFrontPage from './components/FrontPage.vue';
// import WebFrontend from './components/WebFrontend.vue';
// import AdminControlPanel from './components/AdminControlPanel.vue';

import "vuetify/dist/vuetify.min.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";

// import router from "./router";

Vue.use(require("vuetify"));

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    // router,
    data: {
    },
    components: {
        // ThemisFrontPage,
        // WebFrontend,
        // AdminControlPanel
    },
    mounted () {
    }
});

v.$mount("#app");