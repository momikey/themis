<template>
    <!-- Wrapper window for transitions -->
    <v-window v-model="window">
        <!-- Users list -->
        <v-window-item>
            <v-data-table
                :headers="userListHeaders"
                :items="users"
                class="elevation-1"
            >

                <template slot="no-data">
                    <v-alert :value="true" icon="warning">
                        There are no users. This usually means something is wrong with your server.
                        Please create one or more user accounts, including an account with admin privileges.
                    </v-alert>
                </template>

                <template slot="items" slot-scope="props">
                    <tr @click="props.expanded = !props.expanded">
                        <td>{{ props.item.id }}</td>
                        <td>{{ props.item.name }}</td>
                        <td>{{ props.item.server }}</td>
                        <td>{{ props.item.displayName }}</td>
                        <td>{{ props.item.date }}</td>
                    </tr>
                </template>

                <template slot="expand" slot-scope="props">
                    <v-card flat>
                        <v-card-text>{{ props.item.summary }}</v-card-text>
                        <!-- TODO: Render avatar images -->
                        <v-card-text>{{ props.item.icon }}</v-card-text>

                        <v-card-actions>
                            <v-btn flat
                                @click="showPostsByUser(props.item)"
                            >
                                All posts by user
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-data-table>
        </v-window-item>

        <!-- List of posts by user -->
        <v-window-item>
        <v-btn flat class="primary--text"
            @click="window = 0"
        >
            <v-icon left>arrow_back</v-icon>
            Back
        </v-btn>

        <v-data-table v-if="window > 0"
            :headers="postHeaders"
            :items="postsByUser"
            class="elevation-1"
        >

            <template slot="no-data">
                <v-alert :value="true" color="error" icon="warning">
                    User {{ selectedUser.name }} has made no posts
                </v-alert>
            </template>

            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                        <td>{{ props.item.id }}</td>
                        <td>{{ props.item.server}}</td>
                        <td>{{ props.item.subject }}</td>
                        <td>{{ props.item.timestamp }}</td>
                        <td>{{ props.item.deleted }}</td>
                        <td v-if="props.item.content.length < 50">{{ props.item.content }}</td>
                        <td v-else><span class="primary--text text--lighten-3">{Click to show full post}</span></td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>{{ props.item.content }}</v-card-text>
                    <v-card-text>Posted in groups: {{ formatGroupList(props.item.groups) }}</v-card-text>

                    <v-card-actions>
                        <v-btn flat
                        >
                            <v-icon left >remove_circle_outline</v-icon>
                            Delete this post
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-data-table>
        </v-window-item>
    </v-window>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            users: [],
            postsByUser: [],
            selectedUser: null,
            window: 0,

            userListHeaders: [
                { text: 'ID', value: 'id' },
                { text: 'Username', value: 'name' },
                { text: 'Server', value: 'server' },
                { text: 'Nickname', value: 'displayName' },
                { text: 'Date', value: 'timestamp' },
            ],

            postHeaders: [
                { text: 'ID', value: 'id' },
                { text: 'Server', value: 'server' },
                { text: 'Subject', value: 'suvject' },
                { text: 'Date', value: 'timestamp' },
                { text: 'Deleted?', value: 'deleted' },
                { text: 'Content', value: 'content' }
            ],
        }
    },
    methods: {
        getAllUsers () {
            axios.get('/internal/users/get')
            .then(response => {
                this.users = response.data;
                return response;
            })
            .catch(error => console.log(error));
        },
        showPostsByUser (user) {
            this.selectedUser = user;
            this.window = 1;

            axios.get(`/internal/posts/all-by-user/${user.id}`)
            .then(response => {
                this.postsByUser = response.data;
                return response;
            })
            .catch(error => console.log(error));
        },
        formatGroupList (groups) {
            return '[' + groups.map(e => `@${e.name}@${e.server}`).join(',') + ']';
        }
    },
    mounted () {
        this.getAllUsers();
    }
})
</script>

<style>

</style>
