<template>
    <v-layout column>
        <!-- Controls -->
        <v-flex align-self-center>
        <v-dialog v-model="dialog" max-width="600px">
            <!-- Activator button -->
            <v-btn slot="activator" large dark color="primary darken-4"
            >
                <v-icon left>add</v-icon>
                <span>Create new group</span>
            </v-btn>

            <!-- Dialog componoent -->
            <create-group-dialog
                @confirm-create-group="createNewGroup"
                @cancel-create-group="dialog = false"
            />
        </v-dialog>
        </v-flex>
        
        <!-- Group list -->
        <v-expansion-panel>
            <v-expansion-panel-content
                v-for="group in groups"
                :key="group.id"
            >
                <div slot="header">
                    {{group.id}}: <span class="ml-2"><strong>{{group.displayName}}</strong></span>
                    <v-spacer></v-spacer>
                    (@{{group.name}}@{{group.server}})
                </div>
                <v-card>
                    <v-card-text>
                        {{group.summary}}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn flat>View posts</v-btn>
                        <v-btn flat>Edit</v-btn>
                        <v-btn flat>Delete</v-btn>
                    </v-card-actions>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

import CreateGroupDialog from './CreateGroupDialog.vue'

export default Vue.extend({
    data () {
        return {
            groups: [],
            dialog: false,            
        }
    },
    methods: {
        createNewGroup (group) {
            axios.post('/internal/groups/create-group', group)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
            
            this.dialog = false;
        }
    },
    mounted () {
        axios.get("/internal/groups")
            .then(response => (this.groups = response.data))
            .catch(error => console.log(error));
    },
    components: {
        CreateGroupDialog
    }
})
</script>

<style>

</style>
