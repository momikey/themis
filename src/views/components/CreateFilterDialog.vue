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
                        v-model="filterProperty"
                        :items="properties"
                        return-object
                    ></v-select>
                </v-flex>

                <v-flex>
                    <v-select
                        v-model="filterRelation"
                        :items="relations"
                        item-text="description"
                        item-value="type"
                        return-object
                    ></v-select>
                </v-flex>

                <v-flex>
                    <v-text-field
                        label="Text to accept"
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

            filterProperty: (this.currentFilter && this.currentFilter.property) || '',
            filterRelation: (this.currentFilter && this.currentFilter.relation) || '',
            filterValue: (this.currentFilter && this.currentFilter.target) || '',
        }
    },
    props: ['type', 'properties', 'currentFilter'],
    methods: {
        save () {
            const filter = {
                property: this.filterProperty,
                relation: this.filterRelation,
                target: this.filterValue
            }

            this.$emit('save-filter', filter);
        },

        cancel () {
            this.$emit('cancel-filter');
            
            this.$refs.form.reset();
        },
    },
    mounted () {
    }
})
</script>

<style>

</style>
