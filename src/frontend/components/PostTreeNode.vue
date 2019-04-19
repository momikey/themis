<template>
    <v-card dark tile elevation="12" class="pl-2">
        <v-card-title>
            <v-layout wrap>
            <v-flex grow xs10>
                <span class="title">{{ thePost.subject }}</span>
            </v-flex>
            <v-flex xs2>
                <v-tooltip bottom open-delay="600">
                    <template v-slot:activator="{ on }">
                        <span v-on="on">{{ formatTime(thePost.timestamp) }}</span>
                    </template>

                    <span>{{ formatTimeTooltip(thePost.timestamp) }}</span>
                </v-tooltip>
            </v-flex>

            <v-flex xs12>
                <v-tooltip bottom open-delay="600">
                    <template v-slot:activator="{ on }">
                        <span v-on="on">by {{ thePost.sender && thePost.sender.displayName || thePost.sender.name }}</span>
                    </template>

                    <span>{{ formatSender(thePost.sender) }}</span>
                </v-tooltip>
            </v-flex>
            </v-layout>
        </v-card-title>
        <v-card-text>{{ thePost.content }}</v-card-text>

        <v-card-actions>
            <v-container fluid>
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

                <v-expand-transition>
                <v-layout column v-show="isReplying">
                        <v-flex grow>
                        <v-textarea box dark autofocus
                            :label="replyBoxLabel"
                            v-model="replyText"
                        />
                        </v-flex>

                        <v-flex shrink align-self-end>
                        <v-btn dark
                            @click="sendReply"
                        >
                            <v-icon>send</v-icon>
                            <span class="ml-2">Post</span>
                        </v-btn>

                        <v-btn dark
                            @click="cancelReply"
                        >
                            <v-icon>clear</v-icon>
                            <span class="ml-2">Cancel</span>
                        </v-btn>

                        </v-flex>
                </v-layout>
                </v-expand-transition>
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

export default Vue.extend({
    name: 'post-tree-node',

    data() {
        return {
            thePost: this.post,

            isReplying: false,
            replyText: '',

            // TODO: Make this locale-aware
            // We'll put that on the list with the other localization stuff
            replyBoxLabel: "Write your reply here",
            tooltipTimeFormat: "MMM D, YYYY, HH:mm",
        }
    },

    props: [
        'post'
    ],

    inject: [
        'replyTo'
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
                this.thePost = (await FrontendService.getFullPost(this.post)).data;
            }
        },

        showReply () {
            this.isReplying = true;
        },

        cancelReply () {
            this.isReplying = false;
            this.replyText = '';
        },

        sendReply () {
            this.replyTo(this.thePost, this.replyText);

            // Clear out the reply textarea for future use
            this.cancelReply();
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
    }
})
</script>

<style>

</style>
