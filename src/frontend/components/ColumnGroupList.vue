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

            <!--
                "Create new group" button; only shown if user *can*
                create a new group.
            -->
            <v-btn
                block dark class="mt-0" color="primary darken-4"
                v-if="createGroupPermission"
            >
                <v-icon left>add</v-icon>
                <span>Create new group</span>
            </v-btn>

        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { FrontendService } from '../frontend.service';

export default Vue.extend({
    data () {
        return {
            user: '',
            groups: [],
            currentGroup: null,

            createGroupPermission: false,
            groupSubheader: "Showing all groups",
        }
    },

    props: [

    ],

    computed: {

    },

    methods: {
        async getGroupList() {
            try {
                // TODO: Add sort options
                this.groups = (await FrontendService.getGroupList('name')).data;
            } catch (e) {
                console.log(`Error fetching group list: ${e.response}`);
            }
        },

        async userCanCreateGroup() {
            try {
                this.createGroupPermission =
                    (await FrontendService.getUserPermission(this.user, 'create-group')).data;
            } catch (e) {
                console.log(`Error fetching user permissions: ${e.response}`);
            }
        },

        formatGroupName(group) {
            return FrontendService.formatGroupName(group);
        },

        onSelectGroup(group) {
            this.$emit('group-selected', group.id);
        }
    },

    async mounted() {
        this.user = this.$warehouse.get('themis_login_user');
        this.$emit('update-progress', 10);
        await this.getGroupList();
        this.$emit('update-progress', 75);
        await this.userCanCreateGroup();
        this.$emit('update-progress', 100);
    }
})
</script>

<style>

</style>
