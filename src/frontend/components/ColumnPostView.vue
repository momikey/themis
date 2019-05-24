<template>
    <!--
        Wrapper component for the thread view, which is a nested tree
        of individual posts, each in its own component.
    -->
    <v-layout column justify-start class="scroll-y post-view-layout">
        <v-flex class="mb-0 pb-0">
            <v-card dark>
                <v-card-title v-if="post">
                    <h1 class="title">{{ post.subject }}</h1>
                </v-card-title>
            </v-card>
        </v-flex>
        <v-flex>
            <post-tree-node v-if="post" :post="post" />
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

import { FrontendService } from '../frontend.service';
import PostTreeNode from './PostTreeNode.vue';

export default Vue.extend({
    data() {
        return {
            // Holder for the parent post
            parentPost: null
        }
    },

    props: [
        'post',
        'reload'
    ],

    watch: {
        post () {
            this.$emit('update-progress', 100);
        },
    },

    methods: {
        /*
         * Send a request to reply to a post in this thread.
         * This bubbles up to an API call at a higher level.
         */
        replyTo (post, reply) {
            this.$emit('create-reply', post, reply);
        },

        /*
         * Send a request for a user's info. This is emitted
         * when the user clicks on another user's name, and it
         * will display the clicked user's profile in the panel
         * on the right side.
         */
        requestUserInfo (user) {
            this.$emit('request-user', user);
        }
    },

    /*
     * Vue makes it difficult to communicate up and down the hierrachy.
     * You're meant to use either an event bus (hard to do when you're
     * dealing with arbitrary levels of nesting) or Vuex (really more
     * concerned with state than events). But the `provide` method lets
     * us do exactly what we need: inject methods into any descendent
     * of this component.
     * 
     * Basically, any event we want a post to emit will be "provided" here,
     * and "injected" in the post tree node. From there, we can use them
     * like any other.
     */
    provide() {
        return {
            replyTo: this.replyTo,
            requestUserInfo: this.requestUserInfo,
        }
    },

    async mounted() {
        this.$emit('update-progress', 100);
    },

    components: {
        PostTreeNode
    }
})

</script>

<style>
    .post-view-layout {
        /* account for padding */
        max-height: calc(100vh - 72px);
    }
</style>
