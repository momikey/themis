import Vue from "vue";
import WebFrontend from "./components/WebFrontend.vue";

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