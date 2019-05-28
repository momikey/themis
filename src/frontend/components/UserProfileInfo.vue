<template>
    <!-- The bio section for a user's profile settings page -->
    <v-flex id="user"
        :value="profileData"
        @input="$emit('input', profileData)"
    >
        <v-layout column align-center>
            <v-avatar color="secondary" size="250" class="mx-auto">
                <!-- TODO, use a placeholder for now -->
                <v-icon dark size="200" v-if="!profileData.avatarUri">account_circle</v-icon>
            </v-avatar>
            <p class="warning secondary--text text-xs-center mt-2 mb-5 px-3">
                Avatars are not implemented yet
            </p>
        </v-layout>

        <v-form v-model="valid">
            <h1>{{ profileHeaderLabel }}</h1>
            <v-container fluid grid-list-lg>
                <v-layout align-center justify-space-between>
                    <v-flex xs4>
                        <p class="mb-0 text-xs-left">{{ yourUsernameLabel}}</p>
                    </v-flex>
                    <v-flex xs8>
                        <p class="mb-0 font-weight-bold">{{ profileData.username }}</p>
                    </v-flex>
                </v-layout>
                <p class="font-weight-bold my-0">{{ usernameWarning }}</p>

                <v-layout align-center justify-space-between>
                    <v-flex xs4>
                        <p class="mb-0 text-xs-left">{{ yourNicknameLabel }}</p>
                    </v-flex>
                    <v-flex xs8>
                        <v-text-field :placeholder="nicknamePlaceholder"
                            v-model="profileData.displayName"
                        />
                    </v-flex>
                </v-layout>

                <v-layout align-center justify-space-between>
                    <v-flex xs4>
                        <p class="mb-0 text-xs-left">{{ yourSummaryLabel }}</p>
                    </v-flex>
                    <v-flex xs8>
                        <v-textarea no-resize
                            v-model="profileData.summary"
                            :placeholder="summaryPlaceholder"
                        />
                    </v-flex>
                </v-layout>
            </v-container>
        </v-form>
    </v-flex>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { FrontendService } from '../frontend.service';

export default Vue.extend({
    data () {
        return {
            // Model variable for profile form
            valid: false,

            // Backing fields for profile form
            profileData: {
                username: null,
                displayName: null,
                summary: null,
                avatarUri: null,
            },

            // TODO: Implement avatar handling
            avatar: null,

            // TODO: Heavy i18n
            profileHeaderLabel: "Your profile",
            yourUsernameLabel: "Your username",
            usernameWarning: "This cannot be changed",
            yourNicknameLabel: "Your nickname",
            nicknamePlaceholder: "How will you be seen?",
            yourSummaryLabel: "Your bio",
            summaryPlaceholder: "Say a little about yourself",
        }
    },

    props: [
        'username'
    ],

    methods: {
        /*
         * Get the user's data from the server. The "core" parts are
         * in the ActivityPub Actor object, but anything else we add
         * later might need another API call.
         */
        async getUser () {
            const user = (await FrontendService.getLocalUser(this.username)).data;
            this.profileData.username = user.name;
            this.profileData.displayName = user.displayName;
            this.profileData.summary = user.summary;
            this.profileData.avatarUri = user.icon;
        }
    },

    async mounted () {
        await this.getUser();

        // To update the model
        this.$emit('input', this.profileData);
    }
})

</script>

<style>

</style>
