import Vue from "vue";
import ThemisFrontPage from './components/FrontPage.vue';

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