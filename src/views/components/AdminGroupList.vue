<template>
    <!-- Wrapper window to allow transitioning -->
    <v-window v-model="window">

    <v-window-item>
    <v-layout column>
        <!-- Controls -->
        <v-flex align-self-center>
        <v-dialog v-model="showCreateDialog" max-width="600px">
            <!-- Activator button -->
            <v-btn slot="activator" large dark color="primary darken-4"
            >
                <v-icon left>add</v-icon>
                <span>Create new group</span>
            </v-btn>

            <!-- Dialog componoent -->
            <create-group-dialog
                @confirm-create-group="createNewGroup"
                @cancel-create-group="showCreateDialog = false"
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
                    (@{{group.name}}@{{formatServer(group.server)}})
                </div>
                <v-card>
                    <v-card-text>
                        {{group.summary}}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn flat
                            @click="showPostsInGroup(group)"
                        >
                            View posts
                        </v-btn>
                        <v-btn flat
                            @click="requestUpdateGroup(group)"
                        >
                            Edit
                        </v-btn>
                        <v-btn flat
                            @click="requestDeleteGroup(group)"
                        >
                            Delete
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <!-- Group delete dialog -->
        <v-dialog v-model="showConfirmDeleteDialog" max-width="300px" v-if="deletingGroup">
            <v-card>
                <v-card-title class="headline">Delete group {{deletingGroup.name}}?</v-card-title>
                <v-card-text>This action will remove the group from the database.</v-card-text>
                <v-card-actions>
                    <v-btn flat @click="confirmDeleteGroup">Delete</v-btn>
                    <v-btn flat @click="clearDeleteDialog">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Group edit dialog -->
        <v-dialog v-model="showEditDialog" max-width="600px" v-if="updatingGroup">
            <create-group-dialog
                @confirm-create-group="updateGroup"
                @cancel-create-group="clearEditDialog"
                :group="updatingGroup"
            />
        </v-dialog>
    </v-layout>
    </v-window-item>

    <!-- Group post view -->
    <v-window-item>
        <v-btn flat class="primary--text"
            @click="window = 0"
        >
            <v-icon left>arrow_back</v-icon>
            Back
        </v-btn>
        
        <admin-group-posts-list
            v-if="window > 0"
            :group="postsGroup"
        />
    </v-window-item>
    </v-window>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

import { formatServer } from '../../server/format-server';

import CreateGroupDialog from './CreateGroupDialog.vue'
import AdminGroupPostsList from './AdminGroupPostsList.vue'

export default Vue.extend({
    data () {
        return {
            groups: [],
            showCreateDialog: false,
            showConfirmDeleteDialog: false,
            showEditDialog: false,
            updatingGroup: null,
            deletingGroup: null,

            window: 0,
            postsGroup: null
        }
    },
    methods: {
        createNewGroup (group) {
            axios.post('/internal/groups/create-group', group)
            .then(response => console.log(response.data))
            .catch(error => console.log(error.response));
            
            this.showCreateDialog = false;
        },
        clearDeleteDialog () {
            this.showConfirmDeleteDialog = false;
            this.deletingGroup = null;
        },
        clearEditDialog () {
            this.showEditDialog = false;
            this.updatingGroup = null;
        },
        confirmDeleteGroup () {
            this.deleteGroup(this.deletingGroup);
            
            this.clearDeleteDialog();
        },
        requestDeleteGroup (group) {
            this.deletingGroup = group;
            this.showConfirmDeleteDialog = true;
        },
        requestUpdateGroup (group) {
            this.updatingGroup = group;
            this.showEditDialog = true;
        },
        getAllGroups () {
            axios.get('/internal/groups')
            .then(response => (this.groups = response.data))
            .catch(error => console.log(error));
        },
        updateGroup (group) {
            const newGroup = Object.assign(this.updatingGroup, group);
            
            if (newGroup) {
                axios.put(`/internal/groups/update-group/${newGroup.id}`, newGroup)
                .then(response => {
                    this.getAllGroups();
                    return response;
                })
                .catch(error => console.log(error));
            }

            this.clearEditDialog();
        },
        deleteGroup (group) {
            if (group) {
                axios.delete(`/internal/groups/delete-group/${group.id}`)
                .then(response => {
                    console.log(response.data);
                    this.getAllGroups();
                    return response;
                })
                .catch(error => console.log(error));
            }
        },
        showPostsInGroup (group) {
            this.postsGroup = group;
            
            this.window = 1;
        },

        // Delegate, because Vue won't let use imports for some reason
        formatServer (server) {
            return formatServer(server);
        }
    },
    mounted () {
        this.getAllGroups();
    },
    components: {
        CreateGroupDialog,
        AdminGroupPostsList
    }
})
</script>

<style>

</style>
