<template>
    <div class="group-list-container">
        <details class="group-entry" v-for="group in groups" :key="group.id">
            <summary class="group-summary">
                <span class="internal-name">{{formatGroupName(group)}}</span>
                <span class="display-name">({{group.displayName}})</span>
            </summary>
            <ul class='group-info'>
                <li>Server:<span class='group-info-data'>{{group.server}}</span></li>
                <li>Summary:<span class='group-info-data'>{{group.summary}}</span></li>
                <li>Created on:<span class='group-info-data'>{{group.date}}</span></li>
            </ul>
        </details>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import axios from 'axios';

export default Vue.extend({
    data () {
        return {
            groups: []
        }
    },
    methods: {
        formatGroupName: function (group) {
            return `@${group.name}`;
        }
    },
    mounted () {
        axios.get("/internal/groups")
            .then(response => (this.groups = response.data))
            .catch(error => console.log(error));
    }
})
</script>


<style>
    .group-info-data {
        padding-left: 1ex;
    }
</style>