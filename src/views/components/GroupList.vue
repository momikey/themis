<template>
    <v-list class="group-list-container" two-line subheader>
        <v-subheader>
            <v-layout>
                <v-flex align-self-center>
                {{groupSubheader}}
                </v-flex>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <v-btn icon slot="activator"
                        @click="showFilteredGroups"
                    >
                        <v-icon dark
                            :color="filterColor"
                        >
                            filter_list
                        </v-icon>
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
                v-if="!isFiltered || !hiddenGroups.includes(group.id)"
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

                <v-list-tile-action>
                    <v-menu offset-x @click.native.stop="">
                        <v-btn icon slot="activator">
                            <v-icon dark>more_vert</v-icon>
                        </v-btn>

                        <v-list>
                            <v-list-tile v-if="!hiddenGroups.includes(group.id)"
                                @click="hideGroup(group)"
                            >
                                <v-list-tile-title>Hide group</v-list-tile-title>
                            </v-list-tile>

                            <v-list-tile v-else
                                @click="unhideGroup(group)"
                            >
                                <v-list-tile-title>Unhide group</v-list-tile-title>
                            </v-list-tile>

                            <v-list-tile
                                @click="addToFilters(group)"
                            >
                                <v-list-tile-title>Add group to filters</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </v-list-tile-action>
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
            hiddenGroups: [],
            filters: [],
            isFiltered: false,
            currentGroup: null,
            noGroupsText: "No known groups on this server. Create one to get started.",

            // TODO: Make this a prop that gets passed in from server config
            canCreateGroups: true
        }
    },
    computed: {
        groupsWithFilters () {
            return this.filterGroups(this.groups);
        },
        groupSubheader () {
            return (this.isFiltered) ? "Filtered groups" : "All groups";
        },

        filterColor () {
            return (this.isFiltered) ? 'primary' : 'white';
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
        },
        filterGroups (groups) {
            if (!this.isFiltered) {
                return groups;
            } else {
                return this.filters.reduce(
                    (acc, fn) => this.createFilterFunction(fn)(acc),
                    groups)
            }
        },
        showFilteredGroups () {
            this.isFiltered = !this.isFiltered;
        },
        readFilters () {
            const prefs = this.$warehouse.get('themis_client_preferences');

            if (prefs && prefs.filters && prefs.filters.groups) {
                this.filters = prefs.filters.groups;
            }

            if (prefs && prefs.hiddenGroups) {
                this.hiddenGroups = prefs.hiddenGroups;
            }
        },
        writeFilters () {
            const prefs = this.$warehouse.get('themis_client_preferences');

            if (prefs) {
                if (!prefs.filters) {
                    prefs.filters = {};
                } 

                prefs.filters.groups = this.filters;

                prefs.hiddenGroups = this.hiddenGroups
            }

            this.$warehouse.set('themis_client_preferences', prefs);
        },
        addToFilters (group) {

        },
        hideGroup (group) {
            if (!this.hiddenGroups.includes(group.id)) {
                this.hiddenGroups.push(group.id);
            }
        },
        unhideGroup (group) {
            if (this.hiddenGroups.includes(group.id)) {
                const pos = this.hiddenGroups.indexOf(group.id);
                this.hiddenGroups.splice(pos, 1);
            }
        },
    },
    mounted () {
        this.retrieveGroupList();
    }
})
</script>

<style>

</style>
