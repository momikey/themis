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
                    >
                        <v-card-title>{{ thread.subject }}</v-card-title>
                    </v-card>
                </v-list-tile>
            </v-list>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

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

        onSelectThread (post) {
            console.log(post);
        },
    },

    async mounted() {
        await this.loadGroup(this.group);
    }
})

</script>

<style>

</style>
