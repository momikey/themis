<template>
    <!-- Right-side panel to show user info -->
    <v-container fill-height fluid>
        <v-layout column>
            <v-flex xs12 align-self-center>
                <v-avatar color="secondary" size="250">
                    <!-- TODO, use a placeholder for now -->
                    <v-icon dark size="200" v-if="!user.avatarUri">account_circle</v-icon>
                </v-avatar>
            </v-flex>

            <v-flex xs12 align-self-center class="mb-4">
                <h1>{{ formatUserName(user) }}</h1>
            </v-flex>

            <v-flex xs12>
                {{ user.summary }}
            </v-flex>

            <v-divider class="my-4" />

            <!-- TODO: Add follow button and maybe recent posts? -->
        </v-layout>
    </v-container>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () { 
        return {

        }
    },

    props: [
        'user'
    ],

    methods: {
        /*
         * Pretty-print the user's name in both forms. We might change
         * this to allow styling, etc.
         */
        formatUserName (user) {
            return `${user.displayName} (@${user.name}@${user.server.host})`;
        }
    },

    async mounted () {
    },

    async updated () {
    }
})

</script>

<style>

</style>
