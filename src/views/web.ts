import Vue from "vue";
import WebFrontend from "./components/WebFrontend.vue";
import VueWarehouse from "vue-warehouse";

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    el: "#app",
    template: `<web-frontend :userName="loggedInAsUser" />`,
    data: {
        loggedInAsUser: ''
    },
    components: {
        WebFrontend
    },
    mounted () {
        const user = this.$warehouse.get("themis_login_user");

        if (user) {
            this.loggedInAsUser = user;
        }
    }
});