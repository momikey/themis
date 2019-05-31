<template>
    <!--
        The post view. This is a card that displays the post body and metadata,
        then a series of actions (reply, like, etc.) Very similar to any other
        forum-like platform. The difference with Themis is that we're dedicated
        to threading, so we have to have a way to *show* that. Thus, a post also
        has a nested tree node for each of its children, indented slightly to set
        them off from their parent.

        Note that Vuetify has a TreeView component, but we don't use it for this.
        That's because it's geared more towards inline display, and our posts are
        supposed to be block. That's why I hand-rolled this contraption. It's by
        far the best part of Themis, IMO.
    -->
    <v-card dark tile elevation="12" class="pl-2">
        <!--
            Individual posts don't show subjects. Instead, we use the title slot
            for the "core" metadata: sender and time.
        -->
        <v-card-title class="pt-2 pb-0">
            <v-layout column wrap justify-start>
                <v-flex shrink align-self-end>
                    <v-tooltip bottom open-delay="600">
                        <template v-slot:activator="{ on }">
                            <span v-on="on" class="caption">{{ formatTime(thePost.timestamp) }}</span>
                        </template>

                        <span>{{ formatTimeTooltip(thePost.timestamp) }}</span>
                    </v-tooltip>

                    <v-tooltip bottom nudge-left="24" open-delay="600">
                        <template v-slot:activator="{ on }">
                            <span v-on="on" class="caption">
                                by <a target="_blank" class="info-link white--text"
                                    :href="thePost.sender.uri"
                                    @click.stop.prevent="onUserClicked"
                                >
                                    {{ thePost.sender && thePost.sender.displayName || thePost.sender.name }}
                                </a>
                            </span>
                        </template>

                        <span>{{ formatSender(thePost.sender) }}</span>
                    </v-tooltip>
                </v-flex>

            </v-layout>
        </v-card-title>

        <!-- Post content; in the future, make this Markdown or HTML -->
        <v-card-text>
            <div class="post-content">{{ thePost.content }}</div>
        </v-card-text>

        <!-- Post actions, such as replying or marking as a favorite -->
        <v-card-actions>
            <v-container fluid pa-2>
                <v-layout justify-end>
                    <v-flex shrink>
                        <span class="mx-1 my-0 py-0">
                            <v-tooltip bottom close-delay="100" v-if="!hasLiked">
                                <template #activator="{ on }">
                                    <v-btn icon dark
                                        @click="onLikeClicked"
                                        v-on="on"
                                    >
                                        <v-icon>star_border</v-icon>
                                    </v-btn>
                                </template>

                                <span>Like</span>
                            </v-tooltip>
                            <v-tooltip bottom close-delay="100" v-else>
                                <template #activator="{ on }">
                                    <v-btn icon dark
                                        v-on="on"
                                    >
                                        <v-icon color="yellow darken-2">star</v-icon>
                                    </v-btn>
                                </template>

                                <span>You liked this post</span>
                            </v-tooltip>
                        </span>

                        <span class="mx-1 my-0 py-0">
                            <v-tooltip bottom close-delay="100">
                                <template #activator="{ on }">
                                    <v-btn icon dark
                                        @click="showReply"
                                        v-on="on"
                                    >
                                        <v-icon>reply</v-icon>
                                    </v-btn>
                                </template>

                                <span>Reply</span>
                            </v-tooltip>
                        </span>
                    </v-flex>
                </v-layout>

                <component
                    :show="isReplying"
                    :replyTo="thePost.id"
                    :is="(isReplying) ? 'post-reply' : ''"
                    @send-reply="sendReply"
                    @cancel-reply="cancelReply"
                />
            </v-container>
        </v-card-actions>

        <!-- Now, the recursion, making a node for each child -->
        <post-tree-node v-for="child in thePost.children" :key="child.id"
            :post="child"
        />
    </v-card>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { distanceInWordsToNow, format } from 'date-fns';

import { FrontendService } from '../frontend.service';
import PostReply from './PostReply.vue';

export default Vue.extend({
    name: 'post-tree-node',

    data() {
        return {
            // Each node holds only a single post, everything else is handled
            // by the parent container.
            thePost: this.post,

            // If the user wants to reply to a post, we show an inline composer.
            isReplying: false,

            // Has the user liked this post? This is mainly a hack to get around
            // the fact that provide/inject ignores reactivity
            hasLiked: false,

            // TODO: Make this locale-aware
            tooltipTimeFormat: "MMM D, YYYY, HH:mm",
        }
    },

    props: [
        'post'
    ],

    /*
     * As stated in the post view "container" component, we use Vue's
     * provide/inject system to set up an event bus for the whole thread.
     * (They say it's meant for plugins, but it's *perfect* for this situation.)
     */
    inject: [
        'replyTo',
        'requestUserInfo',
        'likePost',
        'likes'
    ],

    watch: {
        /*
         * We watch the post prop in case there are any changes we need
         * to handle. That includes replies, updates, etc. On a change,
         * we cancel any reply in progress, though we might need to find
         * a better way of handling that.
         */
        async post () {
            await this.loadPost();
            this.cancelReply();
        }
    },

    methods: {
        /*
         * Load the post for this node. Basically, the thread view gives us
         * only part of the story, since the server doesn't load all the
         * relations for a post when we retrieve it. So we fill them in here.
         */
        async loadPost () { 
            if (this.post.children) {
                this.thePost = this.post;
            } else {
                try {
                    this.thePost = (await FrontendService.getFullPost(this.post)).data;
                } catch (e) {
                    console.log(`Unable to fetch post ${this.post.id}`);
                }
            }
        },

        /*
         * If the reply button is clicked, show the inline composer.
         */
        showReply () {
            this.isReplying = true;
        },

        /*
         * If the user cancels the reply, hide the composer.
         * TODO: Handle the case where there is a reply in progress
         */
        cancelReply () {
            this.isReplying = false;
        },

        /*
         * Send a reply. This calls the container's method, which
         * does all the heavy lifting in terms of API calls.
         */
        sendReply (reply) {
            this.replyTo(this.thePost, reply);

            // Clear out the reply textarea for future use
            this.cancelReply();
        },

        /*
         * If the like button is clicked, like the post (unless
         * it's already been liked)
         */
        onLikeClicked () {
            this.likePost(this.post);
            this.hasLiked = true;
        },

        /*
         * If the post's sender is clicked, show the info panel.
         */
        onUserClicked () {
            this.requestUserInfo(this.thePost.sender);
        },

        /*
         * Format the post's timestamp into human-readable terms.
         */
        formatTime (timestamp) {
            return distanceInWordsToNow(timestamp, { addSuffix: true });
        },

        /*
         * We set a tooltip for the timestamp, which will show the exact
         * date/time of the post, rather than something like "5 minutes ago".
         */
        formatTimeTooltip (timestamp) {
            return format(timestamp, this.tooltipTimeFormat);
        },

        /*
         * Format the sender's name. As in the thread view, this is just
         * a wrapper. We need it because of Vue's limitations.
         */
        formatSender (sender) {
            return FrontendService.formatUserName(sender);
        }
    },
    
    async mounted () {
        await this.loadPost();

        this.hasLiked = this.likes.has(this.post.id);
    },

    components: {
        PostReply
    }
})
</script>

<style>
    .post-content {
        white-space: pre-wrap;
    }
</style>
