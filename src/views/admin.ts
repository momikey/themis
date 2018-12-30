import Vue from "vue";
import AdminPanel from "./components/AdminPanel.vue";
import VueWarehouse from "vue-warehouse";
import Store from "store";

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    el: "#admin",
    template: "<div><admin-panel /></div>",
    data: {

    },
    components: {
        AdminPanel
    },
    mounted () {
    }
});