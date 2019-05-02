<template>
    <v-card dark tile elevation="12" class="pl-2">
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
        <v-card-text>
            {{ thePost.content }}
        </v-card-text>

        <v-card-actions>
            <v-container fluid pa-2>
                <v-layout justify-end>
                    <v-flex shrink>
                        <span class="my-0 py-0">
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
            thePost: this.post,

            isReplying: false,

            // TODO: Make this locale-aware
            tooltipTimeFormat: "MMM D, YYYY, HH:mm",
        }
    },

    props: [
        'post'
    ],

    inject: [
        'replyTo',
        'requestUserInfo'
    ],

    watch: {
        async post () {
            await this.loadPost();
            this.cancelReply();
        }
    },

    methods: {
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

        showReply () {
            this.isReplying = true;
        },

        cancelReply () {
            this.isReplying = false;
        },

        sendReply (reply) {
            this.replyTo(this.thePost, reply);

            // Clear out the reply textarea for future use
            this.cancelReply();
        },

        onUserClicked () {
            this.requestUserInfo(this.thePost.sender);
        },

        formatTime (timestamp) {
            return distanceInWordsToNow(timestamp, { addSuffix: true });
        },

        formatTimeTooltip (timestamp) {
            return format(timestamp, this.tooltipTimeFormat);
        },

        formatSender (sender) {
            return FrontendService.formatUserName(sender);
        }
    },
    
    async mounted () {
        await this.loadPost();
    },

    components: {
        PostReply
    }
})
</script>

<style>

</style>
