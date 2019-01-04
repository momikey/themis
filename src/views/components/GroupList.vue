<template>
    <v-list class="group-list-container" two-line subheader>
        <v-subheader>
            <v-layout>
                <v-flex align-self-center>
                {{groupSubheader}}
                </v-flex>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <v-btn icon slot="activator">
                        <v-icon dark>filter_list</v-icon>
                    </v-btn>
                    <span>Filter</span>
                </v-tooltip>

                <!-- <v-flex xs1 align-self-center>
                <v-tooltip bottom v-if="canCreateGroups">
                    <v-icon small slot="activator">add</v-icon>
                    <span>Create new group</span>
                </v-tooltip>
                </v-flex> -->
            </v-layout>
        </v-subheader>

        <template v-if="groups.length">
            <v-list-tile class="group-entry" 
                v-for="group in groups" 
                :key="group.id"
                @click="selectGroup(group)"
                :value="currentGroup && group.id === currentGroup.id"
            >
                <v-list-tile-content>
                <v-list-tile-title
                    class="display-name"
                >
                    {{group.displayName}}
                </v-list-tile-title> 

                <v-list-tile-sub-title
                    class="internal-name caption"
                >
                    ({{formatGroupName(group)}})
                </v-list-tile-sub-title>
                </v-list-tile-content>
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
            isFiltered: false,
            currentGroup: null,
            noGroupsText: "No known groups on this server. Create one to get started.",

            // TODO: Make this a prop that gets passed in from server config
            canCreateGroups: true
        }
    },
    computed: {
        groupSubheader () {
            return (this.isFiltered) ? "Filtered groups" : "All groups";
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
        },
        selectGroup (group) {
            this.currentGroup = group;
            this.$emit('group-selected', group);
        }
    },
    mounted () {
        this.retrieveGroupList();
    }
})
</script>

<style>

</style>
