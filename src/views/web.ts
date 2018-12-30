import Vue from "vue";
import WebFrontend from "./components/WebFrontend.vue";
import VueWarehouse from "vue-warehouse";
import Store from "store";

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    el: "#app",
    template: `<web-frontend />`,
    data: {
    },
    components: {
        WebFrontend
    },
    mounted () {
    }
});