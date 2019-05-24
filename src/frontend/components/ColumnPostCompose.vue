<template>
    <!-- Post composer -->
    <v-layout column fill-height class="scroll-y post-compose-layout">
        <v-flex grow>
            <v-form v-model="valid">
                <v-card>

                    <!-- Post subject -->
                    <v-card-title>
                        <v-text-field box autofocus
                            :label="labels.title"
                            v-model="thread.title"
                        />
                    </v-card-title>

                    <!-- Post body (plain text for now) -->
                    <v-card-text>
                        <v-textarea box dark
                            auto-grow rows="10"
                            :label="labels.body"
                            v-model="thread.body"
                        />
                    </v-card-text>

                    <!-- Send, cancel, etc. actions -->
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
            // Validation logic; this doesn't do anything yet
            valid: false,

            // Labels for the UI
            // TODO: i18n
            labels: {
                title: "Thread title",
                body: "What are you thinking?",
            },

            // Post fields; we encapsulate them just to keep them together
            thread: {
                title: '',
                body: ''
            },
        }
    },

    methods: {
        /*
         * Emit a "send post" event, which will be caught by the parent.
         */
        sendPost () {
            this.$emit('create-thread', this.thread);
            this.clearPost();
        },

        /*
         * Send an event to cancel composing a post. This hides the composer view.
         */
        cancelPost () {
            this.$emit('cancel-create-thread');
            this.clearPost();
        },

        /*
         * Helper to clear stale data from the composer view.
         */
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
