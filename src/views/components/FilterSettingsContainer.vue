<template>
    <v-layout>
        <v-flex xs10>
        <v-tabs
            v-model="activeTab"
            color="primary darken-4"
            dark
            grow
        >
            <v-tabs-slider color="secondary"></v-tabs-slider>

            <v-tab
                v-for="tab in tabInfo"
                :key="tab"
            >
                {{ tab }}
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
            <v-tab-item
                v-for="tab in tabInfo"
                :key="tab"
            >
                <filter-list
                    :filters="filters[tab]"
                    :type="tab"
                    :properties="allowedProperties"
                    @create-filter="createNewFilter"
                    @delete-filter="deleteFilter"
                    @update-filter="updateFilter"
                />
            </v-tab-item>
        </v-tabs-items>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import FilterList from './FilterList.vue'

export default Vue.extend({
    data () {
        return {
            filters: {
                groups: [],
                users: [],
            },

            tabInfo: ['groups', 'users'],

            // TODO: probably turn this into an API call or something
            allowedProperties: ['name', 'displayName', 'server', 'summary'],

            activeTab: null
        }
    },
    methods: {
        createNewFilter (filter) {
            this.filters[this.tabInfo[this.activeTab]].push(filter);

            this.saveFilters();
        },

        deleteFilter (index) {
            this.filters[this.tabInfo[this.activeTab]].splice(index, 1);

            this.saveFilters();
        },

        updateFilter (filter, index) {
            this.filters[this.tabInfo[this.activeTab]].splice(index, 1, filter);
        },

        saveFilters () {
            const prefs = this.$warehouse.get('themis_client_preferences') || {};

            if (!prefs.filters) {
                prefs.filters = this.filters;
            } else {
                prefs.filters.groups = this.filters.groups;
                prefs.filters.users = this.filters.users;
            }

            this.$warehouse.set('themis_client_preferences', prefs);        }
    },
    mounted () {
        const prefs = this.$warehouse.get('themis_client_preferences');

        if (prefs && prefs.filters) {
            this.filters = prefs.filters;
        }
    },
    components: {
        FilterList
    }
})
</script>

<style>

</style>
