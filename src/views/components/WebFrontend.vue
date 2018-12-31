<template>
    <div class="three-pane-view">
        <section class="groups-pane pane">
            <header>
                <h1>All known groups</h1>
                <button class="align-right">Create new group</button>
            </header>

            <group-list class="groups-list-container"
                @group-selected="groupSelected"
            />

            <footer>
                <button>Settings</button>
                <span class="logged-in align-right">Logged in as 
                    <strong><span class="username">{{userName}}</span></strong></span>
            </footer>
        </section>

        <div class="vertical container">
        <section class="thread-list pane">
            <header>
                <h1 v-if="currentGroup">Posts in group 
                    <span class="group-name">{{currentGroup.name}}</span>
                </h1>
                <h1 v-else>{{noGroupSelectedText}}</h1>

                <button class="create-post" @click="createPost">New Post</button>
                <button v-if="currentThread" class="create-reply" @click="replyToPost">Reply</button>
            </header>

            <thread-list class="thread-list-container"
                @thread-selected="threadSelected"
                @post-selected="postSelected"
                :group="currentGroup"
            />
        </section>

        <section class="current-post pane">
            <post-editor v-if="isComposingPost"
                @post-submitted="submitPost"
                @post-canceled="cancelPost"
            />
            <p v-else>{{currentPostText}}</p>
        </section>
        </div>
    </div>
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
            currentGroup: null,
            currentThread: null,
            currentPost: null,

            noGroupSelectedText: "No group selected",
            currentPostText: "",

            isComposingPost: false
        }
    },
    props: ['userName'],
    computed: {

    },
    methods: {
        groupSelected (group) {
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
    }
})
</script>

<style>
    .three-pane-view {
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
    }
</style>