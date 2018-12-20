<template>
    <div class="group-list-container">
        <ul v-if="groups.length">
            <li class="group-entry" 
                v-for="group in groups" 
                :key="group.id"
                @click="$emit('group-selected', group)"
            >
                <span class="display-name">{{group.displayName}}</span> 
                <span class="internal-name">({{formatGroupName(group)}})</span>
            </li>
        </ul>
        <p v-else>
            {{noGroupsText}}
        </p>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            groups: [],
            noGroupsText: "No known groups on this server. Create one to get started."
        }
    },
    methods: {
        formatGroupName (group) {
            return `@group-${group.name}@${group.server}`;
        },
        retrieveGroupList () {
            axios.get("/internal/groups")
                .then(response => (this.groups = response.data))
                .catch(error => console.log(error));
        }
    },
    mounted () {
        this.retrieveGroupList();
    }
})
</script>

<style>
    .group-list-container ul {
        list-style-type: none;
    }

    .group-entry {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }
</style>
