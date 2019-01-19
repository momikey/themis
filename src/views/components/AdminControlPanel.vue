<template>
    <v-container fluid>
        <v-layout justify-start row fill-height wrap>
            <v-flex xs3>
            <!-- Navigation -->
            <v-navigation-drawer app dark permanent>
                <v-toolbar>
                    <v-list>
                        <v-list-tile>
                        <v-list-tile-title class="title">
                            Themis Admin Panel
                        </v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-toolbar>

                <v-divider></v-divider>

                <v-list>
                    <v-list-tile
                        v-for="item in panelItems"
                        :key="item.title"
                        @click="navigate(item)"
                    >
                        <v-list-tile-action>
                            <v-icon>{{item.icon}}</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>{{item.title}}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-navigation-drawer>
            </v-flex>

            <v-flex xs9>
            <!-- Body components -->
            <component :is="currentComponent" />
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'

import AdminUserList from './AdminUserList.vue'
import AdminGroupList from './AdminGroupList.vue'

export default Vue.extend({
    data () {
        return {
            currentComponent: null,

            panelItems: [
                { title: 'Users', icon: 'people', action: 'users', component: 'AdminUserList' },
                { title: 'Groups', icon: 'category', action: 'groups', component: 'AdminGroupList' },
                { title: 'Site Preferences', icon: 'settings', action: 'prefs' },
                { title: 'Log out', icon: 'power_settings_new', action: 'logout' }
            ]
        }
    },
    methods: {
        navigate (loc) {
            // TODO
            this.currentComponent = loc.component;
        },
    },
    components: {
        AdminUserList,
        AdminGroupList
    }
})

</script>

<style>

</style>
