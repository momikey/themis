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
    <main-navigation
        v-model="showDrawer"
        :user-avatar="userAvatar"
    />

    <!-- Info panel: this will pop up to show information about a user or group -->
    <v-navigation-drawer app dark right temporary
        :width="440"
        v-model="showInfo"
    >
        <info-panel
            v-if="infoPanelUser"
            :user="infoPanelUser"
        />
    </v-navigation-drawer>

    <!-- Main layout: three columns by default, but change on mobile -->
    <v-content>

        <!-- Progress bar, used for posting, etc. -->
        <v-progress-linear
            v-model="progress"
            :active="progress > 0"
            height="4"
            color="success"
            class="ma-0"
        />

        <v-container fluid fill-height grid-list-md class="main-container">
            <v-layout justify-start row wrap class="main-layout">
                <!-- Left column: group list -->
                <v-flex xs12 sm6 md3 grow>
                    <column-group-list
                        @group-selected="onGroupSelected"
                        @group-created="onGroupCreated"
                        @update-progress="onProgressUpdated"
                    />
                </v-flex>

                <!-- Middle column: thread list -->
                <v-flex xs12 sm6 md3 grow>
                    <column-thread-list v-if="selectedGroup"
                        :group="selectedGroup"
                        :reload="reloadGroup"
                        @thread-selected="onThreadSelected"
                        @thread-create-started="onThreadStarted"
                        @update-progress="onProgressUpdated"
                    />
                </v-flex>

                <!-- Right column: post and reply -->
                <v-flex xs12 md6 grow>
                    <column-post-view v-if="selectedThread"
                        :post="selectedThread"
                        :reload="reloadThread"
                        @create-reply="onReplyCreated"
                        @update-progress="onProgressUpdated"
                        @request-user="onRequestUser"
                    />
                    <column-post-compose v-else-if="newThread"
                        @create-thread="onThreadCreated"
                        @cancel-create-thread="onThreadCanceled"
                        @update-progress="onProgressUpdated"
                    />
                </v-flex>
            </v-layout>
        </v-container>
    </v-content>
</div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';
import { UserRole } from '../../user/user-authentication/user-authentication.role';

import { FrontendService } from '../frontend.service';
import { PostSubmit } from '../post-submit.service';

import ColumnGroupList from './ColumnGroupList.vue';
import ColumnThreadList from './ColumnThreadList.vue';
import ColumnPostView from './ColumnPostView.vue';
import ColumnPostCompose from './ColumnPostCompose.vue';
import MainNavigation from './MainNavigation.vue';
import InfoPanel from './InfoPanel.vue';

export default Vue.extend({
    data() {
        return {
            showDrawer: false,
            showInfo: false,

            userAvatar: null,

            progress: 0,

            selectedGroup: null,
            selectedThread: null,
            newThread: null,

            infoPanelUser: null,

            reloadGroup: false,
            reloadThread: false,
        }
    },

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

    methods: {
        drawerClicked () {
            this.showDrawer = !this.showDrawer;
        },

        showInfoPanel () {
            this.showInfo = !this.showInfo;
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

        onProgressUpdated (newVal) {
            this.progress = newVal;

            if (this.progress >= 100) {
                setTimeout(() => {
                    this.progress = 0;
                }, 200);
            }
        },

        async onGroupSelected(groupId) {
            if (this.selectedGroup !== groupId) {
                this.selectedGroup = groupId;
                this.selectedThread = null;
                await this.reloadThreadList();
            }
        },

        onGroupCreated(groupName) {
            this.selectedThread = null;
        },

        onThreadSelected (thread) {
            this.selectedThread = thread;
        },

        onThreadStarted () {
            this.selectedThread = null;
            this.newThread = true;
        },

        async onThreadCreated (thread) {
            const username = this.$warehouse.get('themis_login_user');
            const token = this.$warehouse.get('themis_login_token');

            this.onProgressUpdated(25);

            try {
                await PostSubmit.submitPostAP(
                    username,
                    token,
                    thread.title,
                    thread.body,
                    this.selectedGroup
                );

                this.onProgressUpdated(100);
                await this.reloadThreadList();

            } catch (e) {
                this.onProgressUpdated(100);
                console.log(e);
            }

            this.newThread = false;
        },

        onThreadCanceled () {
            this.newThread = false;
        },

        async onReplyCreated (post, reply) {
            const username = this.$warehouse.get('themis_login_user');
            const token = this.$warehouse.get('themis_login_token');

            this.onProgressUpdated(25);

            try {
                await PostSubmit.submitPostAP(
                    username,
                    token,

                    // TODO Implement changing subjects
                    post.subject,

                    reply,
                    this.selectedGroup,
                    post
                );

                this.onProgressUpdated(100);

                const temp = this.selectedThread;
                this.selectedThread = null;
                await this.$nextTick();
                this.selectedThread = temp;
            } catch (e) {
                this.onProgressUpdated(100);
                console.log(e);
            }
        },

        async onRequestUser (user) {
            this.infoPanelUser = user;
            this.showInfoPanel();
        },

        async reloadThreadList () {
            this.reloadGroup = true;
            await this.$nextTick();
            this.reloadGroup = false;
        },
    },

    async mounted () {

    },

    components: {
        ColumnGroupList,
        ColumnThreadList,
        ColumnPostView,
        ColumnPostCompose,
        MainNavigation,
        InfoPanel
    }
})

</script>

<style>
    .main-container {
        padding: 12px;
    }

    .v-list.full-height {
        /* account for padding */
        max-height: calc(100vh - 72px);
    }

    .info-link {
        text-decoration: none;
    }
</style>
