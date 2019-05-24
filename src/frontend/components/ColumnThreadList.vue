<template>
    <v-layout column justify-start fill-height class="thread-list-layout">
        <v-flex>
            <!-- List of threads in this group -->
            <v-list three-line subheader class="scroll-y full-height"
                v-if="groupEntity"
            >
                <!--
                    Subheader will say which groups are shown, and also
                    have the "New Thread" button.
                -->
                <v-subheader>
                    {{ threadListSubheader }}
                    <v-spacer />
                    <v-tooltip bottom close-delay="100">
                        <template #activator="{ on }">
                            <v-btn icon dark
                                @click="onCreateNewThread"
                                v-on="on"
                            >
                                <v-icon>create</v-icon>
                            </v-btn>
                        </template>

                        <span>New thread</span>
                    </v-tooltip>
                </v-subheader>

                <!--
                    The actual thread list. Each entry is a card so we
                    can do more complex formatting.
                -->
                <template v-if="groupThreads.length">
                    <v-list-tile dark
                        v-for="thread in groupThreads"
                        :key="thread.id"
                        @click="onSelectThread(thread)"
                    >
                        <v-card dark flat tile
                            elevation="0"
                            color="rgba(0,0,0,0)"
                            width="100%"
                        >
                            <v-container fluid class="pa-0"><v-layout row wrap justify-start>
                            <v-flex xs9 grow>
                                <v-card-text class="pa-0 body-2">{{ thread.subject }}</v-card-text>
                                <v-card-text class="pt-0 body-1">
                                    {{ formatFrom(thread.sender) }}
                                </v-card-text>
                            </v-flex>

                            <v-spacer />

                            <v-flex xs1>
                                <span class="caption narrow">{{ formatTime(thread.timestamp) }}</span>
                            </v-flex>

                            </v-layout></v-container>
                        </v-card>
                    </v-list-tile>
                </template>

                <!-- If the group doesn't have any threads, show a message saying as much -->
                <template v-else>
                    <v-list-tile dark>
                        {{ noThreadsText }}
                    </v-list-tile>
                </template>
            </v-list>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { distanceInWordsStrict, format } from 'date-fns';

import { FrontendService } from '../frontend.service';

export default Vue.extend({
    data () {
        return {
            // The usual "container" variables for this component
            groupEntity: null,
            groupThreads: [],

            // UI Labels
            // TODO: i18n
            noThreadsText: "This group has no posts. Create one by clicking the button above.",
        }
    },

    props: [
        'group',
        'reload'
    ],

    computed: {
        threadListSubheader() {
            return `All threads in ${this.groupEntity.name}`;
        },
    },

    watch: {
        async reload () {
            if (this.reload) {
                await this.loadGroup(this.group);
            }
        }
    },

    methods: {
        /*
         * Load this group, if possible. This method fetches the metadata,
         * and it calls `loadThreads()` below to get the actual posts.
         */
        async loadGroup(id) {
            if (id) {
                try {
                    this.$emit('update-progress', 10);
                    this.groupEntity = (await FrontendService.getGroupFromId(this.group)).data;
                    this.$emit('update-progress', 40);
                    await this.loadThreads(this.groupEntity);
                    this.$emit('update-progress', 100);
                } catch (e) {
                    console.log(`Could not load group ${this.group}`);
                }
            }
        },

        /*
         * Load the group's threads. This only fetches the parent posts
         * for each thread, to save on network usage.
         */
        async loadThreads(group) {
            try {
                this.groupThreads = (await FrontendService.getGroupThreads(group)).data;
            } catch (e) {
                console.log(`Error fetching threads for group ${group.name}`);
            }
        },

        /*
         * Format a timestamp into a short, human-readable value.
         * For example, a time of 5 minutes ago should show as "5m", etc.
         * (This matches Mastodon and Pleroma.)
         * 
         * TODO: We'll need to rewrite this once we add localization
         */
        formatTime(timestamp) {
            const distance = distanceInWordsStrict(new Date, timestamp, { partialMethod: 'round' });
            const [num, unit] = distance.split(' ');
            const singular = (unit.endsWith('s')) ? unit.substring(0, unit.length-1) : unit;

            switch (singular) {
                case 'second':
                    return num + 's';
                case 'minute':
                    return num + 'm';
                case 'hour':
                    return num + 'h';
                case 'day':
                    return num + 'd';
                case 'month':
                    return format(timestamp, "MMM D");
                case 'year':
                    return format(timestamp, "MMM D, YY");
                default:
                    throw new Error("Invalid date");
            }
        },

        /*
         * Format the sender of a thread's root post. At the moment,
         * this simply shows the "display" name or, if that isn't present,
         * the username.
         */
        formatFrom(sender) {
            return `by ${sender.displayName || sender.name}`;
        },

        /*
         * Send an event when a thread is selected, so it can be shown
         * in the thread pane.
         */
        onSelectThread(post) {
            this.$emit('thread-selected', post);
        },

        /*
         * Send an event to start creating a new thread in the
         * selected group. This component won't have anything to do
         * with that; it's all handled by the post composer.
         */
        onCreateNewThread() {
            this.$emit('thread-create-started');
        }
    },

    async mounted() {
        await this.loadGroup(this.group);
    },
})

</script>

<style>
    .narrow {
        line-height: 0.5;
    }
</style>
