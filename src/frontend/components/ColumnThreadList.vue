<template>
    <v-layout column justify-start fill-height class="thread-list-layout">
        <v-flex>
            <!-- List of threads in this group -->
            <v-list three-line subheader class="scroll-y full-height"
                v-if="groupEntity"
            >
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
            groupEntity: null,
            groupThreads: [],
            activePost: null,
        }
    },

    props: [
        'group'
    ],

    computed: {
        threadListSubheader() {
            return `All threads in ${this.groupEntity.name}`;
        },
    },

    methods: {
        async loadGroup(id) {
            try {
                this.$emit('update-progress', 10);
                this.groupEntity = (await FrontendService.getGroupFromId(this.group)).data;
                this.$emit('update-progress', 40);
                await this.loadThreads(this.groupEntity);
                this.$emit('update-progress', 100);
            } catch (e) {
                console.log(`Could not load group ${this.group}`);
            }
        },

        async loadThreads(group) {
            try {
                this.groupThreads = (await FrontendService.getGroupThreads(group)).data;
            } catch (e) {
                console.log(`Error fetching threads for group ${group.name}`);
            }
        },

        formatTime(timestamp) {
            const distance = distanceInWordsStrict(new Date, timestamp, { partialMethod: 'round' });
            const [num, unit] = distance.split(' ');
            switch (unit) {
                case 'seconds':
                    return num + 's';
                case 'minutes':
                    return num + 'm';
                case 'hours':
                    return num + 'h';
                case 'days':
                    return num + 'd';
                case 'months':
                    return format(timestamp, "MMM D");
                case 'years':
                    return format(timestamp, "MMM D, YY");
                default:
                    throw new Error("Invalid date");
            }
        },

        formatFrom(sender) {
            return `by ${sender.displayName || sender.name}`;
        },

        onSelectThread (post) {
            this.$emit('thread-selected', post);
        },

        onCreateNewThread () {
            this.$emit('thread-create-started');
        }
    },

    async mounted() {
        await this.loadGroup(this.group);
    }
})

</script>

<style>
    .narrow {
        line-height: 0.5;
    }
</style>
