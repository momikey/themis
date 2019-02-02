<template>
    <v-card class="pa-3">
        <v-card-title>
            Filter for {{ type }}
        </v-card-title>

        <v-form
            ref="form"
            v-model="valid"
        >
            <v-layout column>
                <v-flex>
                    <v-subheader>Show {{ type }} whose</v-subheader>
                    <v-select
                        v-model="filter.property"
                        :items="properties"
                    ></v-select>
                </v-flex>

                <v-flex>
                    <v-select
                        v-model="filter.relation"
                        :items="relations"
                        item-text="description"
                        item-value="type"
                    ></v-select>
                </v-flex>

                <v-flex>
                    <v-text-field
                        label="Text to accept"
                        v-model="filter.target"
                    />
                </v-flex>
            </v-layout>
        </v-form>

        <v-card-actions>
            <v-btn
                color="primary darken-4"
                @click="save"
            >
                Save Filter
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
            // TODO: Add validation
            valid: true,

            relations: [
                { type: 'equals', description: 'equals' },
                { type: 'doesNotEqual', description: 'does not equal' },
                { type: 'contains', description: 'contains' },
                { type: 'startsWith', description: 'starts with' },
                { type: 'endsWith', description: 'ends with' },
                { type: 'regExp', description: 'matches' }
            ],

            filter: {
                property: (this.currentFilter && this.currentFilter.property) || '',
                relation: (this.currentFilter && this.currentFilter.relation) || '',
                target: (this.currentFilter && this.currentFilter.target) || '',
            }
        }
    },
    props: ['type', 'properties', 'currentFilter'],
    watch: {
        currentFilter: function (newVal) {
            if (newVal) {
                this.filter.property = newVal.property;
                this.filter.relation = newVal.relation;
                this.filter.target = newVal.target;
            } else {
                this.filter.property = '';
                this.filter.relation = '';
                this.filter.target = '';
            }
        }
    },
    methods: {
        save () {
            this.$emit('save-filter', this.filter);
        },

        cancel () {
            this.$emit('cancel-filter');
        },
    },
    mounted () {
    }
})
</script>

<style>

</style>
