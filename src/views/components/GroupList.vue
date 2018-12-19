<template>
    <div class="group-list-container">
        <ul>
            <li class="group-entry" 
                v-for="group in groups" 
                :key="group.id"
                @click="$emit('group-selected', group)"
            >
                {{group.displayName}} ({{formatGroupName(group)}})
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            groups: []
        }
    },
    methods: {
        formatGroupName (group) {
            return `@group-${group.name}@${group.server}`;
        },
    },
    mounted () {
        axios.get("/internal/groups")
            .then(response => (this.groups = response.data))
            .catch(error => console.log(error));
    }
})
</script>

<style>

</style>
