<template>
    <!--
        The user profile page, where we'll hold all the bio-type
        info for a Themis user. This isn't intended to be a public
        page. Rather, it's the settings page for the user, and we'll
        likely add more settings as time goes on.

        As with the "main" FE page, we use a wrapper div here,
        since we'll have navigation and other components that
        might need to be outside the content.
    -->
    <div>
        <!--
            Navigation panel/drawer

            Note the use of breakpoints. On mobile, the navigation drawer
            is actually a drawer. Everything else has room to let it serve
            as a simple panel.
         -->
        <v-navigation-drawer app dark
            :permanent="$vuetify.breakpoint.smAndUp"
            v-model="drawer"
        >
            <!-- We only need a button to close the drawer on mobile -->
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

        <!-- We also only need the button to *open* the drawer on mobile -->
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

        <!--
            Notifications for update success/failure. We may be able
            to combine these into one.
        -->
        <v-snackbar bottom left
            v-model="updateSuccess"
            color="success"
            :timeout="5000"
        >
            {{ updateSuccessLabel }}
            <v-btn dark flat
                @click = 'updateSuccess = false'
            >
                Close
            </v-btn>
        </v-snackbar>

        <v-snackbar bottom left
            v-model="updateFailure"
            color="error"
            :timeout="5000"
        >
            {{ updateFailureLabel }}
            <v-btn dark flat
                @click = 'updateFailure = false'
            >
                Close
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { FrontendService } from '../frontend.service';

import UserProfileInfo from './UserProfileInfo.vue';
import UserProfileAccount from './UserProfileAccount.vue';

export default Vue.extend({
    data () {
        return {
            // Backing fields
            user: null,
            account: null,
            profile: null,

            // Navigation (we're not using vue-router here, because it's
            // all on the same page)
            navigation: [
                { label: "User profile", key: "user" },
                { label: "Account settings", key: "account"}
            ],

            // Display variables
            showDrawer: null,
            component: null,

            // Notification stuff
            // TODO: i18n
            updateSuccess: false,
            updateFailure: false,
            updateSuccessLabel: "Successfully updated your profile",
            updateFailureLabel: "Couldn't update your profile"
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
        /*
         * Show/hide the navigation drawer (only on mobile)
         */
        drawerClicked () {
            this.showDrawer = !this.showDrawer;
        },

        /*
         * If a navigation item is clicked, go to the appropriate anchor.
         * We don't use vue-router for this, since all we really need is
         * page-internal scrolling.
         */
        navigate (target) {
            this.$vuetify.goTo(`#${target}`);
        },

        /*
         * Handle the user's request to save their profile data
         */
        async onSaveChanges () {
            try {
                const token = this.$warehouse.get("themis_login_token");
                await FrontendService.updateUserProfile(this.user, token, this.profile);
                this.updateSuccess = true;
            } catch (e) {
                console.log(e);
                this.updateFailure = true;
            }
        },

        /*
         * If the user cancels editing, go back to the main Themis view
         */
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
