<template>
    <v-container fluid class="three-pane-view">
        <v-layout justify-start row fill-height wrap>
        <v-flex xs3>
            <v-toolbar dense dark color="primary darken-4">
            <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>
            <v-toolbar-title>@{{userName}}</v-toolbar-title>
            </v-toolbar>

            <v-layout column fill-height>

            <v-flex xs1>
            <group-list
                @group-selected="groupSelected"
            />
            </v-flex>

            <v-flex>
            <v-btn block dark class="mt-0" color="primary darken-4">
                <v-icon left>add</v-icon>
                <span>Create new group</span>
            </v-btn>
            </v-flex>
            </v-layout>
        </v-flex>

        <v-flex xs9>
            <v-layout column fill-height>
            
            <v-toolbar dense dark color="primary darken-4" class="mx-3">

            <v-toolbar-title v-if="currentGroup">
                Posts in group <span class="group-name">{{currentGroup.name}}</span>
            </v-toolbar-title>
            <v-toolbar-title v-else>{{noGroupSelectedText}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-tooltip v-if="currentGroup">
            <v-btn icon dark slot="activator"
                class="create-post"
                @click="createPost"
            >
                <!-- New Post -->
                <v-icon dark>create</v-icon>
            </v-btn>
            <span>New post</span>
            </v-tooltip>

            </v-toolbar>

            <v-flex d-flex style="overflow: auto; height: 36vh">
                <thread-list class="thread-list-container"
                    @thread-selected="threadSelected"
                    @post-selected="postSelected"
                    :group="currentGroup"
                />
            </v-flex>

            <v-flex d-flex class="ml-3 mt-3" style="height: 52vh">
                <post-editor v-if="isComposingPost"
                    @post-submitted="submitPost"
                    @post-canceled="cancelPost"
                />
                <v-layout v-else-if="currentPost" row>
                    <v-flex d-flex xs6 grow>                    
                    <post-view
                        :post="currentPost"
                        @reply-clicked="startReply"
                        @reply-submitted="submitReply"
                        @reply-canceled="cancelReply"
                        style="overflow: auto"
                    />
                    </v-flex>

                    <v-slide-x-transition>
                    <v-flex d-flex xs6 grow class="ml-1"
                        v-if="isComposingReply"
                        origin="center right"
                    >
                    <post-editor class="px-2 pt-2"
                        :initial-subject="replySubject"
                        @post-submitted="submitReply"
                        @post-canceled="cancelReply"
                    />
                    </v-flex>
                    </v-slide-x-transition>
                </v-layout>
                <div v-else></div>
            </v-flex>
            </v-layout>
        </v-flex>
        </v-layout>
    
        <v-navigation-drawer
            v-model="drawer"
            dark
            absolute
            temporary
        >
            <v-toolbar flat>
                <v-list class="pa-0">
                    <v-list-tile avatar>
                        <!-- Avatar goes here -->

                        <v-list-tile-content>
                            <v-list-tile-title>@{{userName}}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-toolbar>

            <v-list class="pt-0" dense>
                <v-divider></v-divider>

                <v-list-tile
                    v-for="item in actions"
                    :key="item.title"
                    @click="navigate(item)"
                >
                    <v-list-tile-action>
                        <v-icon dark>{{item.icon}}</v-icon>
                    </v-list-tile-action>

                    <v-list-tile-content>
                        <v-list-tile-title>{{item.title}}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>

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
    </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

import GroupList from './GroupList.vue'
import ThreadList from './ThreadList.vue'
import PostEditor from './PostEditor.vue'
import PostView from './PostView.vue'

export default Vue.extend({
    data () {
        return {
            userName: null,
            currentGroup: null,
            currentThread: null,
            currentPost: null,

            noGroupSelectedText: "No group selected",
            currentPostText: "",

            isComposingPost: false,
            isComposingReply: false,
            replySubject: null,

            drawer: false,

            actions: [
                { title: 'Home', icon: 'dashboard', route: ''},     // TODO
                { title: 'Profile', icon: 'person', route: 'settings/profile' },
                { title: 'Favorites', icon: 'star', route: '' },    // TODO
                { title: 'Filters', icon: 'filter_list', route: 'settings/filters' },
                { title: 'Preferences', icon: 'settings', route: 'settings/preferences' },
            ],
        }
    },
    computed: {

    },
    methods: {
        groupSelected (group) {
            if (group !== this.currentGroup) {
                this.currentThread = null;
                this.currentPost = null;
                this.isComposingPost = false;
            }

            this.currentGroup = group;
        },
        threadSelected (thread) {
            if (thread !== this.currentThread) {
                this.isComposingPost = false;
                this.currentThread = thread;

                this.cancelReply();
            }

            this.postSelected(thread);
        },
        async postSelected (post) {            
            if (post !== this.currentPost) {

                if (post.content === undefined) {
                    const response = await axios.get(`/internal/posts/get/${post.uuid}`);

                    if (response) {
                        post = response.data;
                    } else {
                        // TODO: Error handling
                    }
                }
                
                this.isComposingPost = false;
                this.currentPost = post;

                this.cancelReply();
            }
        },
        createPost () {
            if (this.currentGroup) {
                this.isComposingPost = true;
            } else {
                console.log("No group selected!");
            }
        },
        submitPost (post) {
            post.group = this.currentGroup.id;
            post.sender = this.userName;

            axios.post('/internal/posts/new-thread', post)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
        },
        cancelPost () {
            this.isComposingPost = false;
        },
        startReply() {
            this.isComposingReply = true;
            this.replySubject = this.currentPost.subject;
        },
        submitReply (reply) {
            reply.group = this.currentGroup.id;
            reply.sender = this.userName;
            reply.parent = this.currentPost.id;

            axios.post(`/internal/posts/reply-to/${this.currentPost.uuid}`, reply)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
        },
        cancelReply () {
            // TODO
            this.isComposingReply = false;
            this.replySubject = null;
        },
        drawerClicked () {
            // TODO: Open the navigation drawer.
            // (Oh, and actually *make* a navigation drawer!)
            this.drawer = !this.drawer;
        },
    
        navigate (loc) {
            if (loc.route) {
                this.$router.push(loc.route);
            }
        },
        logout () {
            // TODO
        }
    },
    components: {
        GroupList,
        ThreadList,
        PostEditor,
        PostView
    },
    mounted () {
        const user = this.$warehouse.get("themis_login_user");

        if (user) {
            this.userName = user;
        }
    }
})
</script>

<style>

</style>