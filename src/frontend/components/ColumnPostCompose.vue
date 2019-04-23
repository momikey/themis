<template>
    <v-layout column fill-height class="scroll-y post-compose-layout">
        <v-flex grow>
            <v-form v-model="valid">
                <v-card>
                    <v-card-title>
                        <v-text-field box autofocus
                            :label="labels.title"
                            v-model="thread.title"
                        />
                    </v-card-title>

                    <v-card-text>
                        <v-textarea box dark
                            auto-grow rows="10"
                            :label="labels.body"
                            v-model="thread.body"
                        />
                    </v-card-text>

                    <v-card-actions>
                        <v-container pt-0>
                            <v-layout justify-end>
                                <v-flex shrink>
                                    <v-btn dark
                                        @click="sendPost"
                                    >
                                        <v-icon>send</v-icon>
                                        <span class="ml-2">Post</span>
                                    </v-btn>

                                    <v-btn dark
                                        @click="cancelPost"
                                    >
                                        <v-icon>clear</v-icon>
                                        <span class="ml-2">Cancel</span>
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-actions>

                </v-card>
            </v-form>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () {
        return {
            valid: false,

            labels: {
                title: "Thread title",
                body: "What are you thinking?",
            },

            thread: {
                title: '',
                body: ''
            },
        }
    },

    methods: {
        sendPost () {
            this.$emit('create-thread', this.thread);
            this.clearPost();
        },

        cancelPost () {
            this.$emit('cancel-create-thread');
            this.clearPost();
        },

        clearPost () {
            this.thread.title = '';
            this.thread.body = '';
        }
    },
})

</script>

<style>
    .post-compose-layout {
        /* account for padding */
        max-height: calc(100vh - 72px);
    }
</style>
