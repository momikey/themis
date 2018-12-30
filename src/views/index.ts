import Vue from "vue";
import ThemisFrontPage from './components/FrontPage.vue';
import VueWarehouse from "vue-warehouse";

Vue.use(VueWarehouse, {
    store: require("store/dist/store.modern")
})

let v = new Vue({
    el: "#app",
    template: `<themis-front-page class="themis-front-page" />`,
    data: {
    },
    components: {
        ThemisFrontPage
    },
    mounted () {
    }
});