<template>
    <v-card class="pa-3">
    <v-form
        ref="form"
        v-model="valid"
    >
        <v-layout column>
            <h1 class="mb-3">Create a new group</h1>

            <v-text-field
                label="Name"
                placeholder="Short identifier"
                v-model="name"
            ></v-text-field>

            <v-text-field
                label="Display name"
                placeholder="Longer name to show users"
                v-model="displayName"
            ></v-text-field>

            <v-textarea
                label="Description"
                placeholder="Describe the group for your users"
                v-model="summary"
            ></v-textarea>
        </v-layout>
    </v-form>
        <v-card-actions>
            <v-btn
                color="primary darken-4"
                @click="create"
            >
                Create
            </v-btn>

            <v-btn
                @click="cancel"
            >
                Cancel
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'

export default Vue.extend({
    data () {
        return {
            name: (this.group && this.group.name) || '',
            displayName: (this.group && this.group.displayName) || '',
            summary: (this.group && this.group.summary) || '',

            // TODO: Add validation?
            valid: true
        }
    },
    props: [ 'group' ],
    methods: {
        create () {
            this.$emit('confirm-create-group', {
                name: this.name,
                displayName: this.displayName,
                summary: this.summary
            });

            this.$refs.form.reset();
        },
        cancel () {
            this.$emit('cancel-create-group');

            this.$refs.form.reset();
        }
    }
})
</script>

<style>

</style>
