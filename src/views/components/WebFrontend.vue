<template>
    <div class="three-pane-view">
        <section class="groups-pane pane">
            <header>
                <h1>All known groups</h1>
            </header>

            <group-list class="groups-list-container"
                @group-selected="groupSelected"
            />

            <footer>
                <button>Create new group</button>
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
            {{currentPostText}}
        </section>
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import GroupList from './GroupList.vue'
import ThreadList from './ThreadList.vue'

export default Vue.extend({
    data () {
        return {
            currentGroup: null,
            currentThread: null,
            currentPost: null,

            noGroupSelectedText: "No group selected",
            currentPostText: "",
        }
    },
    computed: {

    },
    methods: {
        groupSelected (group) {
            this.currentGroup = group;
        },
        threadSelected (thread) {
            this.currentThread = thread;
        },
        postSelected (post) {
            this.currentPost = post;
        },
        createPost () {

        },
        replyToPost () {

        }
    },
    components: {
        GroupList,
        ThreadList,
    }
})
</script>

<style>
    .three-pane-view {
        display: flex;
        align-items: stretch;
        width: 100%;
        height: 100%;
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
        justify-items: stretch;
    }

    .thread-list header button {
        margin-left: auto;
    }

    .current-post {
        flex-grow: 1;
    }
</style>