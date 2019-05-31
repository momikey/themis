<template>
    <!--
        The favorites page, aka the likes list. This is nothing more
        than a simple list of posts the user has liked. At the moment,
        I'm not sure just how much I want to put on here. Liking posts
        isn't really a "core" Themis function; we're more interested in
        getting replies than stars.
    -->
    <div>
        <!-- Content -->
        <v-content>
            <v-container fluid>
                <v-layout column align-content-space-between>
                    <!--
                        Favorites list - show a placeholder while we're loading,
                        then switch to the list view or, if there aren't any posts,
                        a message telling the user what's going on.
                    -->
                    <v-flex v-if="likedPosts == null">
                        {{ loadingLikesLabel }}
                    </v-flex>

                    <v-flex v-else-if="likedPosts.length">
                        <v-card v-for="post in likedPosts" :key="post.id">
                            <v-card-title class="pb-1">
                                <v-layout wrap justify-start align-baseline>
                                    <v-flex shrink>
                                        <h1 class="title">{{post.subject}}</h1>
                                    </v-flex>
                                    <v-flex grow>
                                        <h2 class="subheading pl-3">by {{ formatSender(post.sender) }}</h2>
                                    </v-flex>
                                    <v-flex shrink>
                                        <v-tooltip bottom open-delay="600">
                                            <template v-slot:activator="{ on }">
                                                <p v-on="on" class="pl-5 text-xs-right">
                                                    {{ formatTime(post.timestamp) }}
                                                </p>
                                            </template>

                                            <span>{{ formatTimeTooltip(post.timestamp) }}</span>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-card-title>

                            <v-card-text class="pt-1">
                                <div class="post-content">{{ post.content }}</div>
                            </v-card-text>
                        </v-card>
                    </v-flex>

                    <v-flex v-else>
                        {{ noLikesLabel }}
                    </v-flex>

                    <!-- Action buttons -->
                    <v-flex align-self-center class="mt-2">
                        <v-btn color="primary"
                            @click="back"
                        >
                            Back
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { distanceInWordsToNow, format } from 'date-fns'

import { FrontendService } from '../frontend.service';

export default Vue.extend({
    data () {
        return {
            // List of posts the user has liked
            likedPosts: null,

            // API stuff
            user: null,
            token: null,

            // Labels (TODO: localize)

            // In case the user hasn't liked any posts
            noLikesLabel: "You haven't liked any posts yet",

            // In case we're still loading the list
            loadingLikesLabel: "Loading your favorites",

            // Time format for post tooltip
            // TODO: Make this locale-aware
            tooltipTimeFormat: "MMM D, YYYY, HH:mm",
        }
    },

    methods: {
        /*
         * Load the liked posts and sort them in reverse chronological order.
         */
        async loadPosts () {
            // TODO Add other sort orders?
            this.likedPosts = (await FrontendService.getLikedPosts(this.user, this.token)).data.sort(
                (a, b) => b.id - a.id
            );
        },

        /*
         * Go back to the previous page. No smart logic here; we just
         * move one step back in the history.
         */
        back () {
            this.$router.back();
        },

        /*
         * Format the sender's name. As in the thread view, this is just
         * a wrapper. We need it because of Vue's limitations.
         */
        formatSender (sender) {
            return FrontendService.formatUserName(sender);
        },

        /*
         * We set a tooltip for the timestamp, which will show the exact
         * date/time of the post, rather than something like "5 minutes ago".
         */
        formatTimeTooltip (timestamp) {
            return format(timestamp, this.tooltipTimeFormat);
        },

        /*
         * Format the post's timestamp into human-readable terms.
         */
        formatTime (timestamp) {
            return distanceInWordsToNow(timestamp, { addSuffix: true });
        },
    },

    async mounted () {
        this.user = this.$warehouse.get('themis_login_user');
        this.token = this.$warehouse.get('themis_login_token');

        await this.loadPosts();
    }
})

</script>

<style>
    .post-content {
        white-space: pre-wrap;
    }
</style>
