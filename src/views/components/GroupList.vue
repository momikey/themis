<template>
    <div id="group-list-container">
        <ul class="group-list">
            <li v-for="group in groups" :key="group.preferredUsername">
                <group-list-entry
                    :display="group.preferredUsername" 
                    :internal="group.id"
                    @group-clicked="groupClicked"
                />
            </li>
        </ul>
    </div>    
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios';
import GroupListEntry from './GroupListEntry.vue';

export default Vue.extend({
    data () { 
        return {
            groups: []
        }
    },
    methods: {
        groupClicked (event) {
            console.log(event);
            
        }
    },
    mounted () {
        axios.get("/api/group/all")
            .then(response => (this.groups = response.data))
            .catch(error => console.log(error));
    },
    components: {
        GroupListEntry
    }
})
</script>

<style>

</style>
