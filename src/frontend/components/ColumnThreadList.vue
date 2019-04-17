<template>
    <v-layout column justify-start fill-height>
        <v-flex>
            <!-- List of threads in this group -->
            <v-list three-line subheader class="scroll-y full-height"
                v-if="groupEntity"
            >
                <v-subheader>
                    {{ threadListSubheader }}
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

                        <v-flex xs2>
                            <span class="caption">{{ formatTime(thread.timestamp) }}</span>
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

import { distanceInWordsToNow } from 'date-fns';

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
                this.groupEntity = (await FrontendService.getGroupFromId(this.group)).data;
                await this.loadThreads(this.groupEntity);
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
            return distanceInWordsToNow(timestamp);
        },

        formatFrom(sender) {
            return `by ${sender.displayName || sender.name}`;
        },

        onSelectThread (post) {
            this.$emit('thread-selected', post);
        },
    },

    async mounted() {
        await this.loadGroup(this.group);
    }
})

</script>

<style>

</style>
