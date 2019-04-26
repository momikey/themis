<template>
    <v-dialog v-model="show"
        persistent no-click-animation
        max-width="480px"
    >
        <template #activator="{ on }">
            <!--
                "Create new group" button; only shown if user *can*
                create a new group.
            -->
            <v-btn
                block dark class="mt-0" color="primary darken-4"
                v-on="on"
            >
                <v-icon left>add</v-icon>
                <span>Create new group</span>
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="headline">
                {{ createNewGroupText }}
            </v-card-title>

            <v-form v-model="valid" class="px-2">
                <v-container>
                    <v-layout column>
                        <v-text-field
                            v-model="form.longName"
                            :counter="100"
                            :label="groupNameLabel"
                            required
                        />

                        <v-text-field
                            v-model="form.shortName"
                            :counter="60"
                            :label="groupShortNameLabel"
                            :hint="groupShortNameHint"
                            required
                        />

                        <v-layout row class=".caption">
                            <v-flex shrink>
                                {{ groupAddressLabel }}
                            </v-flex>

                            <v-spacer />

                            <v-flex shrink>
                                {{ groupAddress }}
                            </v-flex>
                        </v-layout>

                        <v-textarea
                            v-model="form.summary"
                            :label="groupSummaryLabel"
                            :hint="groupSummaryHint"
                            no-resize
                            lines="5"
                        />
                    </v-layout>
                </v-container>
            </v-form>

            <v-card-actions>
                <v-btn
                    @click.stop="create"
                >
                    Create
                </v-btn>

                <v-btn
                    @click.stop="dismiss"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () {
        return {
            valid: false,
            show: false,

            form: {
                shortName: '',
                longName: '',
                summary: ''
            },

            createNewGroupText: "Create a new group",
            groupNameLabel: "Group name",
            groupShortNameLabel: "Short name",
            groupShortNameHint: "Must be unique on this server",
            groupSummaryLabel: "Description",
            groupSummaryHint: "What is this group about?",
            groupAddressLabel: "Follow this group:",
        }
    },

    computed: {
        groupAddress() {
            return `@group-${this.form.shortName}`;
        }
    },

    methods: {
        create() {
            this.$emit('create-group', this.form);
            this.dismiss();
        },

        dismiss() {
            this.clearForm();
            this.show = false;
        },

        clearForm() {
            this.form = {
                shortName: '',
                longName: '',
                summary: ''
            }
        }
    },
})

</script>

<style>

</style>
