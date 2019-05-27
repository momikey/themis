<template>
    <!-- An inline composer intended for replies to a post -->
    <v-expand-transition>
        <v-layout column :id="id" :v-show="show">
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
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () {
        return {
            // Backing field for the post
            // TODO: Possibly add the ability to change the subject
            replyText: '',

            // TODO: Make this locale-aware
            // We'll put that on the list with the other localization stuff
            replyBoxLabel: "Write your reply here",
        }
    },

    props: [
        'replyTo',
        'show'
    ],

    computed: {
        id () {
            return `reply-${this.replyTo}`;
        }
    },

    methods: {
        /*
         * Emit an event to send the reply.
         */
        sendReply () {
            this.$emit('send-reply', this.replyText);
            this.clearReplyText();
        },

        /*
         * Emit an event to cancel the reply. This hides the
         * composer and clears its form fields.
         */
        cancelReply () {
            this.$emit('cancel-reply');
            this.clearReplyText();
        },

        /*
         * Clear the form by resetting the backing field. Because
         * this component is reused, this prevents stale data from
         * showing up.
         */
        clearReplyText () {
            this.replyText = '';
        }
    },

    mounted () {
    }
})
</script>

<style>

</style>
