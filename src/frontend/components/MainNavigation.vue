<template>
    <v-navigation-drawer app dark absolute temporary
        :value="value"
    >
        <!--
            Navbar header, with user name, role, and avatar
            Note that this is the same as the main toolbar for now, 
            but we may add to it in the future
        -->
        <v-toolbar flat color="primary darken-4">
            <v-toolbar-title>
                <v-avatar color="secondary">
                    <!-- TODO: Use user's avatar if available -->
                    <v-icon dark large v-if="!userAvatar">account_circle</v-icon>
                </v-avatar>
                <span class="pl-3">@{{ userName }}</span>
                <span class="pl-3">({{ userRole.text }})</span>
            </v-toolbar-title>
        </v-toolbar>

        <!-- Navigation items list -->
        <v-list class="pt-0">

            <v-list-tile
                v-for="item in navigationActions"
                :key="item.title"
                :to="item.route"
            >
                <v-list-tile-action>
                    <v-icon dark>{{ item.icon }}</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

            <v-list-tile v-if="isAdmin"
                to="admin"
            >
                <v-list-tile-action>
                    <v-icon dark>build</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>Admin</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

            <v-divider/>

            <v-list-tile to="logout">
                <v-list-tile-action>
                    <v-icon dark>power_settings_new</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>Log out</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';
import { UserRole } from '../../user/user-authentication/user-authentication.role';

export default Vue.extend({
    data () {
        return {
            navigationActions: [
                { title: 'Home', icon: 'dashboard', route: 'web'},     // TODO
                { title: 'Profile', icon: 'person', route: 'user/profile' },
                { title: 'Favorites', icon: 'star', route: 'user/favorites' },    // TODO
                { title: 'Filters', icon: 'filter_list', route: 'user/filters' },
                { title: 'Preferences', icon: 'settings', route: 'user/preferences' },
            ],

        }
    },

    props: [
        'userAvatar',
        'value'
    ],

    computed: {
        userName () {
            return this.$warehouse.get('themis_login_user') || '';
        },

        userRole () {
            const role = this.$warehouse.get('themis_login_role');

            return {
                role,
                text: UserRole[role] || 'unknown'
            };
        },

        isAdmin: function () {
            return this.userRole.role == UserRole.Admin;
        },
    },
})

</script>

<style>

</style>
