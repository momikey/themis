<template>
    <v-layout column justify-start fill-height class="group-list-layout">
        <v-flex>
            <!-- List of all groups known to this server -->
            <v-list three-line subheader class="scroll-y full-height">
                <v-subheader>
                    {{ groupSubheader }}
                </v-subheader>

                <template v-if="groups.length">
                    <v-list-tile
                        v-for="group in groups"
                        :key="group.id"
                        @click="onSelectGroup(group)"
                        :value="currentGroup && group.id === currentGroup.id"
                    >
                        <v-list-tile-content>
                            <v-list-tile-title>
                                <span>{{ group.displayName }}</span>
                            </v-list-tile-title>

                            <v-list-tile-sub-title>
                            <span class="caption">{{ formatGroupName(group) }}</span>
                            </v-list-tile-sub-title>

                            <v-list-tile-sub-title class="text--primary">
                            {{ group.summary }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                        </v-list-tile-action>

                    </v-list-tile>
                </template>
            </v-list>

            <!-- Group creation dialog -->
            <dialog-group-create
                @create-group="onCreateGroup"
                v-if="createGroupPermission"
            />
        </v-flex>

    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { FrontendService } from '../frontend.service';

import DialogGroupCreate from './DialogGroupCreate.vue';

export default Vue.extend({
    data () {
        return {
            // Fill in with server data
            user: '',
            groups: [],

            // The current group, mostly used to prevent unnecessary
            // calls to the server
            currentGroup: null,

            // Can the user create groups? If not, don't show the button.
            createGroupPermission: false,

            // Labels
            // TODO: i18n
            groupSubheader: "Showing all groups",

            // State variables for showing/hiding parts of the UI
            showGroupCreateDialog: false,
        }
    },

    props: [

    ],

    computed: {

    },

    methods: {
        /*
         * Get the list of groups this server knows about.
         * That includes both local and foreign groups, (assuming
         * the server federates in the latter case).
         */
        async getGroupList() {
            try {
                // TODO: Add sort options
                this.groups = (await FrontendService.getGroupList('name')).data;
            } catch (e) {
                console.log(`Error fetching group list: ${e.response}`);
            }
        },

        /*
         * Check to see if the user is allowed to create groups
         * on this server. If so, we'll set the approriate variable,
         * which will activate the "Create New Group" button
         */
        async userCanCreateGroup() {
            try {
                this.createGroupPermission =
                    (await FrontendService.getUserPermission(this.user, 'create-group')).data;
            } catch (e) {
                console.log(`Error fetching user permissions: ${e.response}`);
            }
        },

        /*
         * Format a group's short name as a Webfinger-style string.
         * This matches what is done in e.g., Mastodon.
         */
        formatGroupName(group) {
            return FrontendService.formatGroupName(group);
        },

        /*
         * Event emitter for when a group is selected.
         */
        onSelectGroup(group) {
            this.$emit('group-selected', group.id);
        },

        /*
         * Send a group creation request to the server. This may not
         * succeed, though the case of lacking permissions shouldn't
         * come up unless the user is doing something naughty.
         */
        async onCreateGroup(groupData) {
            const token = this.$warehouse.get('themis_login_token');
            this.$emit('update-progress', 50);

            try {
                await FrontendService.createGroup(
                    token,
                    groupData.shortName,
                    groupData.longName,
                    groupData.summary
                );

                this.$emit('update-progress', 90);
                await this.getGroupList();
                this.$emit('update-progress', 100);
                this.$emit('group-created', groupData.shortName);
            } catch (e) {
                this.$emit('update-progress', 50);
                console.log(e);
            }
        },
    },

    /*
     * When this component is mounted, it loads the group list
     * and gets the "create group" permission for the user.
     */
    async mounted() {
        this.user = this.$warehouse.get('themis_login_user');
        this.$emit('update-progress', 10);
        await this.getGroupList();
        this.$emit('update-progress', 75);
        await this.userCanCreateGroup();
        this.$emit('update-progress', 100);
    },

    components: {
        DialogGroupCreate
    }
})
</script>

<style>

</style>
