<template>
    <v-card>
        <v-layout>
        <v-card-title primary-title>
            <v-layout column>
                <v-flex>
                <div class="headline">{{post.subject}}</div>
                </v-flex>

                <v-tooltip right>
                <v-flex slot="activator">
                <div class="caption">by {{post.sender.displayName || post.sender.name}}</div>
                </v-flex>

                <span>{{formatSender(post.sender)}}</span>
                </v-tooltip>

                <v-tooltip right>
                <v-flex slot="activator">
                    <div class="caption">{{formatDate(post.timestamp)}}</div>
                </v-flex>

                <span>{{rawDate(post.timestamp)}}</span>
                </v-tooltip>
            </v-layout>
        </v-card-title>

        <v-spacer></v-spacer>

        <v-card-actions>
            <v-tooltip bottom>
            <v-btn icon dark slot="activator"
                class="create-reply"
                @click="reply"
            >
                <!-- Reply -->
                <v-icon dark>reply</v-icon>
            </v-btn>
            <span>Reply</span>
            </v-tooltip>

            <v-tooltip bottom>
            <v-btn icon dark slot="activator"
                class="like-post"
            >
                <!-- Like -->
                <v-icon dark>star_border</v-icon>
            </v-btn>
            <span>Like</span>
            </v-tooltip>

            <v-tooltip bottom>
            <v-btn icon dark slot="activator"
                class="post-options"
            >
                <!-- Post options -->
                <v-icon>more_vert</v-icon>
            </v-btn>
            <span>Post options</span>
            </v-tooltip>
        </v-card-actions>
        </v-layout>

        <v-card-text>
                {{post.content}}
        </v-card-text>

    </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { distanceInWordsToNow, parse, format } from 'date-fns'

export default Vue.extend({
    props: [
        'post'
    ],
    computed: {

    },
    methods: {
        formatSender (sender) {
            // Coptied from ThreadList
            // We need to make this something that isn't repeated, probably in a service class
            return `${sender.displayName} (@${sender.name}@${sender.server})`;
        },
        formatDate (date) {
            // TODO: Make this pretty
            return distanceInWordsToNow(parse(date), {
                includeSeconds: true,
                addSuffix: true
            });
        },
        rawDate (date) {
            // TODO: Make this locale-aware
            return format(
                parse(date),
                "MMM D, YYYY, HH:mm"
            );
        },
        reply () {
            this.$emit('reply-clicked');
        }
    },
    mounted () {

    },
})
</script>

<style>

</style>
