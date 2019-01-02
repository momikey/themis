<template>
    <v-container fluid class="three-pane-view"><v-layout justify-start row fill-height wrap>
        <v-flex xs3>
        <section class="groups-pane">
            <header>
                <v-toolbar dense dark color="primary darken-4">
                <v-toolbar-title>All known groups</v-toolbar-title>

                <v-spacer></v-spacer>

                <v-tooltip>
                <v-btn icon dark slot="activator"
                    class="create-group"
                >
                    <!-- Create new group -->
                    <v-icon>add</v-icon>
                </v-btn>
                <span>Create new group</span>
                </v-tooltip>

                </v-toolbar>
            </header>

            <group-list class="groups-list-container"
                @group-selected="groupSelected"
            />

            <footer>
                <button>Settings</button>
                <span class="logged-in">Logged in as 
                    <strong><span class="username">{{userName}}</span></strong></span>
            </footer>
        </section>
        </v-flex>

        <v-flex xs9>
            <v-layout column fill-height>
            
            <v-flex d-flex>
            <section class="thread-list">
                <header>
                    <v-toolbar dense dark color="primary darken-4">

                    <v-toolbar-title v-if="currentGroup">
                        Posts in group <span class="group-name">{{currentGroup.name}}</span>
                    </v-toolbar-title>
                    <v-toolbar-title v-else>{{noGroupSelectedText}}</v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-tooltip>
                    <v-btn icon dark slot="activator"
                        class="create-post"
                        @click="createPost"
                    >
                        <!-- New Post -->
                        <v-icon dark>create</v-icon>
                    </v-btn>
                    <span>New post</span>
                    </v-tooltip>

                    <v-tooltip>
                    <v-btn icon dark slot="activator"
                        v-if="currentThread"
                        class="create-reply"
                        @click="replyToPost"
                    >
                        <!-- Reply -->
                        <v-icon dark>reply</v-icon>
                    </v-btn>
                    <span>Reply</span>
                    </v-tooltip>

                    </v-toolbar>
                </header>

                <thread-list class="thread-list-container"
                    @thread-selected="threadSelected"
                    @post-selected="postSelected"
                    :group="currentGroup"
                />
            </section>
            </v-flex>

            <v-flex d-flex>
            <section class="current-post">
                <post-editor v-if="isComposingPost"
                    @post-submitted="submitPost"
                    @post-canceled="cancelPost"
                />
                <p v-else>{{currentPostText}}</p>
            </section>
            </v-flex>
            </v-layout>
        </v-flex>
    </v-layout></v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

import GroupList from './GroupList.vue'
import ThreadList from './ThreadList.vue'
import PostEditor from './PostEditor.vue'

export default Vue.extend({
    data () {
        return {
            userName: null,
            currentGroup: null,
            currentThread: null,
            currentPost: null,

            noGroupSelectedText: "No group selected",
            currentPostText: "",

            isComposingPost: false
        }
    },
    computed: {

    },
    methods: {
        groupSelected (group) {
            if (group !== this.currentGroup) {
                this.currentThread = null;
            }

            this.currentGroup = group;
        },
        threadSelected (thread) {
            this.currentThread = thread;

            // TODO: temp
            this.currentPostText = this.currentThread.content;
        },
        postSelected (post) {
            this.currentPost = post;
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
        replyToPost () {

        }
    },
    components: {
        GroupList,
        ThreadList,
        PostEditor
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
    /* .three-pane-view {
        display: flex;
        align-items: stretch;
        width: 100%;
        height: 100%;
        min-height: 100%;
    }

    .three-pane-view .vertical.container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: stretch;
    }

    .groups-pane {
        width: 30%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    .groups-list-container {
        flex-grow: 1;
    }

    .pane > footer {
        padding-bottom: 1em;
    }

    .pane > header, .pane > .groups-list-container, .pane > footer {
        flex-shrink: 0;
    }

    .thread-list {
        min-height: 40%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .thread-list header {
        display: flex;
        align-items: center;
    }

    .thread-list header button:nth-of-type(1) {
        margin-left: auto;
    }

    .current-post {
        flex-grow: 1;
    }

    .groups-pane header {
        display: flex;
        align-items: center;
        padding-right: 2em;
    }

    .align-right {
        margin-left: auto;
    }

    .logged-in {
        margin-left: 2em;
    } */
</style>