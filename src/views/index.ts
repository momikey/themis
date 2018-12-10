import Vue from "vue";
import GroupList from "./components/GroupList.vue";
import GroupListEntry from "./components/GroupListEntry.vue";

let v = new Vue({
    el: "#app",
    template: `
    <div id="test">
        <group-list />
    </div>
    `,
    data: {
        name: "World",
        info: null
    },
    components: {
        GroupList, GroupListEntry
    },
    mounted () {
    }
});