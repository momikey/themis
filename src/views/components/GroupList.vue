<template>
    <v-list class="group-list-container">
        <template v-if="groups.length">
            <v-list-tile class="group-entry" 
                v-for="group in groups" 
                :key="group.id"
                @click="$emit('group-selected', group)"
            >
                <span class="display-name">{{group.displayName}}</span> 
                <span class="internal-name">({{formatGroupName(group)}})</span>
            </v-list-tile>
        </template>
        <p v-else>
            {{noGroupsText}}
        </p>
    </v-list>
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

</style>
