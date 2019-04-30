<template>
<div>
    <!--
        As with the "main" FE page, we use a wrapper div here,
        since we'll have navigation and other components that
        might need to be outside the content.
    -->
    <v-navigation-drawer app dark
        :permanent="$vuetify.breakpoint.smAndUp"
        v-model="drawer"
    >
        <v-toolbar absolute dense dark color="primary darken-4"
            v-if="$vuetify.breakpoint.xs"
        >
            <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>
        </v-toolbar>

        <v-list class="pt-0">
            <v-list-tile
                v-for="item in navigation"
                :key="item.key"
                @click="navigate(item.key)"
            >
                {{ item.label }}
            </v-list-tile>
        </v-list>

    </v-navigation-drawer>

    <v-toolbar app absolute dense dark color="primary darken-4"
        v-if="$vuetify.breakpoint.xs"
    >
        <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>

    </v-toolbar>

    <!-- Here's the main content -->
    <v-content>
        <v-container fluid>
            <v-layout column align-content-space-between>
                <user-profile-info
                    v-if="user"
                    v-model="profile"
                    :username="user"
                />
                
                <v-divider />

                <user-profile-account />

                <v-divider />

                <v-flex align-self-center class="mt-2">
                    <v-btn color="primary"
                        @click="onSaveChanges"
                    >
                        Save changes
                    </v-btn>

                    <v-btn
                        @click="onCancel"
                    >
                        Cancel
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import UserProfileInfo from './UserProfileInfo.vue';
import UserProfileAccount from './UserProfileAccount.vue';

export default Vue.extend({
    data () {
        return {
            user: null,
            account: null,
            showDrawer: null,
            component: null,

            navigation: [
                { label: "User profile", key: "user" },
                { label: "Account settings", key: "account"}
            ],

            profile: null,
        }
    },

    computed: {
        drawer: {
            get () {
                return this.$vuetify.breakpoint.smAndUp || this.showDrawer;
            },

            set (v) {
                this.showDrawer = v;
            }
        }
    },

    methods: {
        drawerClicked () {
            this.showDrawer = !this.showDrawer;
        },

        navigate (target) {
            this.$vuetify.goTo(`#${target}`);
        },

        onSaveChanges () {
            console.log(this.profile);
        },

        onCancel () {
            this.$router.back();
        }
    },

    async mounted () {
        this.user = this.$warehouse.get('themis_login_user');
    },

    components: {
        UserProfileInfo,
        UserProfileAccount
    }
})

</script>

<style>

</style>
