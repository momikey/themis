<template>
    <v-card>
        <v-list v-if="filters.length">
            <v-list-tile
                v-for="(filter, index) in filters"
                :key="index"
            >
                <v-list-tile-content>
                    {{ filter }}
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-flex>
                    <v-tooltip bottom>
                        <v-btn icon slot="activator"
                            @click="edit(index)"
                        >
                            <v-icon>edit</v-icon>
                        </v-btn>
                        Edit
                    </v-tooltip>

                    <v-tooltip bottom>
                        <v-btn icon slot="activator"
                            @click="deleteFilter(index)"
                        >
                            <v-icon>delete</v-icon>
                        </v-btn>
                        Delete
                    </v-tooltip>
                    </v-flex>
                </v-list-tile-action>
            </v-list-tile>
        </v-list>

        <v-card-text v-else>
            No filters of this type. Create one to get started.
        </v-card-text>

        <v-card-actions>
            <v-btn @click="showDialog = true">
                <v-icon left>add</v-icon>
                    Create new filter
            </v-btn>
        </v-card-actions>

        <!-- Keep the dialog separate, since we recycle it for editing -->
        <v-dialog v-model="showDialog" width="50%" lazy>
            <create-filter-dialog
                :type="type"
                :properties="properties"
                :current-filter="currentFilter"
                @save-filter="save"
                @cancel-filter="cancelDialog"
            />
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import CreateFilterDialog from './CreateFilterDialog.vue'

export default Vue.extend({
    data () {
        return {
            showDialog: false,
            isEditingExisting: false,
            currentFilterIndex: -1,
            currentFilter: null
        }
    },
    props: ['filters', 'type', 'properties'],
    methods: {
        cancelDialog () {
            this.showDialog = false;
            this.isEditingExisting = false;
            this.currentFilterIndex = -1;
            this.currentFilter = null;
        },

        edit (index) {
            this.isEditingExisting = true;
            this.currentFilterIndex = index;
            this.currentFilter = this.filters[index];
            this.showDialog = true;
        },

        save (filter) {
            // Pass the filter up the chain, so the container can handle it.
            if (this.isEditingExisting) {
                this.$emit('update-filter', filter, this.currentFilterIndex);
            } else {
                this.$emit('create-filter', filter);
            }

            this.cancelDialog();
        },

        deleteFilter (index) {
            this.$emit('delete-filter', index);
        }
    },
    components: {
        CreateFilterDialog
    }
})
</script>

<style>

</style>
