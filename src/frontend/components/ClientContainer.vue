<template>
<!--
    We need a wrapper div because Vue doesn't let us use
    <template> tags as root elements, but an app toolbar
    can't go inside the layout container. Also, we have to
    move the nav drawer out so its height is set correctly.
-->
<div>
    <!-- Toolbar: user menu -->
    <v-toolbar app absolute dense dark color="primary darken-4">
        <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>
        <v-toolbar-title>
            <v-avatar color="secondary" size=32>
                <!-- TODO: Use user's avatar if available -->
                <v-icon dark v-if="!userAvatar">account_circle</v-icon>
            </v-avatar>
            <span class="pl-3">@{{ userName }}</span>
            <span class="pl-3" v-if="userRole.role > 3">({{ userRole.text }})</span>
        </v-toolbar-title>
    </v-toolbar>

    <!-- Navigation: this is hidden until the user clicks the menu button -->
    <v-navigation-drawer app dark absolute temporary
        v-model="showDrawer"
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
                @click="navigate(item)"
            >
                <v-list-tile-action>
                    <v-icon dark>{{ item.icon }}</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

            <v-list-tile v-if="isAdmin"
                @click="navigate({route: 'admin'})"
            >
                <v-list-tile-action>
                    <v-icon dark>build</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>Admin</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

            <v-divider/>

            <v-list-tile @click="logout">
                <v-list-tile-action>
                    <v-icon dark>power_settings_new</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>Log out</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>

        </v-list>
    </v-navigation-drawer>

    <!-- Main layout: three columns by default, but change on mobile -->
    <v-content>
    <v-container fluid fill-height grid-list-sm>
        <v-layout justify-start row wrap>
            <!-- Left column: group list -->
            <v-flex xs12 sm6 md3>
                <column-group-list
                />
            </v-flex>

            <!-- Middle column: thread list -->
            <v-flex xs12 sm6 md3>
            </v-flex>

            <!-- Right column: post and reply -->
            <v-flex xs12 md6>
            </v-flex>
        </v-layout>
    </v-container>
    </v-content>
</div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';
import { UserRole } from '../../user/user-authentication/user-authentication.role';

import ColumnGroupList from './ColumnGroupList.vue';

export default Vue.extend({
    data() {
        return {
            showDrawer: false,

            userAvatar: null,

            navigationActions: [
                { title: 'Home', icon: 'dashboard', route: ''},     // TODO
                { title: 'Profile', icon: 'person', route: 'settings/profile' },
                { title: 'Favorites', icon: 'star', route: '' },    // TODO
                { title: 'Filters', icon: 'filter_list', route: 'settings/filters' },
                { title: 'Preferences', icon: 'settings', route: 'settings/preferences' },
            ],
        }
    },

    computed: {
        userName() {
            return this.$warehouse.get('themis_login_user') || '';
        },

        userRole() {
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

    methods: {
        drawerClicked() {
            this.showDrawer = !this.showDrawer;
        },

        navigate (loc) {
            if (loc.route) {
                this.$router.push(loc.route);
            }
        },

        logout () {
            // TODO: Remove auth stuff, so we're *really* logged out
            this.$router.push('/');
        },
    },

    async mounted() {

    },

    components: {
        ColumnGroupList
    }
})

</script>

<style>

</style>
