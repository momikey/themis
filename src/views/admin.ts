import Vue from "vue";

import AdminPanel from "./components/AdminPanel.vue";

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