<template>
    <v-card dark tile elevation="8" class="pl-2">
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

        <v-card-actions></v-card-actions>

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

            // TODO: Make this locale-aware
            // We'll put that on the list with the other localization stuff
            tooltipTimeFormat: "MMM D, YY, HH:mm",
        }
    },

    props: [
        'post'
    ],

    watch: {
        async post () {
            await this.loadPost();
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

        formatTime(timestamp) {
            return distanceInWordsToNow(timestamp, { addSuffix: true });
        },

        formatTimeTooltip(timestamp) {
            return format(timestamp, this.tooltipTimeFormat);
        },

        formatSender(sender) {
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
