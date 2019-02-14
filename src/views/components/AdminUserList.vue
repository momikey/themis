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
                        <td>
                            <v-tooltip bottom>
                            <v-btn slot="activator" flat icon
                                @click="showUserAuthentication(props.item)"
                            >
                                <v-icon>edit</v-icon>
                            </v-btn>
                            Edit
                            </v-tooltip>
                        </td>
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

        <!-- User authentication and role -->
        <v-window-item>
        <v-btn flat class="primary--text"
            @click="window = 0"
        >
            <v-icon left>arrow_back</v-icon>
            Back
        </v-btn>

        <v-card>
            <p class="title text-xs-center pt-5">
                User {{ selectedUser.name }} (#{{ selectedUser.id }})
            </p>

            <v-list two-line>
                <v-list-tile>
                    <v-list-tile-sub-title>Internal name</v-list-tile-sub-title>
                    <v-list-tile-title>{{selectedUser.name}}</v-list-tile-title>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-sub-title>Display name</v-list-tile-sub-title>
                    <v-list-tile-title>{{selectedUser.displayName}}</v-list-tile-title>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-sub-title>Email address</v-list-tile-sub-title>
                    <v-list-tile-title>{{selectedUserAuth.email}}</v-list-tile-title>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-sub-title>Role</v-list-tile-sub-title>
                    <v-list-tile-title>{{roleForUser(selectedUserAuth)}}</v-list-tile-title>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-sub-title>Created on</v-list-tile-sub-title>
                    <v-list-tile-title>{{formatDate(selectedUser.timestamp)}}</v-list-tile-title>
                </v-list-tile>

                <v-list-tile>
                    <v-list-tile-sub-title>Last login</v-list-tile-sub-title>
                    <v-list-tile-title>{{formatDate(selectedUserAuth.lastLoggedIn)}}</v-list-tile-title>
                </v-list-tile>
            </v-list>

            <v-bottom-nav dark color="primary darken-4">
                <v-btn
                    v-for="action in userActions"
                    :key="action.key"
                    @click="adminUserAction(action)"
                >
                    {{ action.text }}
                </v-btn>
            </v-bottom-nav>
        </v-card>
        </v-window-item>

        <v-dialog v-model="showChangeRole" max-width="300px">
            <v-card>
                <v-card-title>Change {{selectedUser.name}} to:</v-card-title>
                <v-list>
                    <v-list-tile
                        v-for="role in userRoles"
                        :key="role"
                        @click="changeRole(role)"
                    >
                        {{role}}
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-dialog>
    </v-window>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'
import { format, parse } from 'date-fns'

import { UserRole } from '../../user/user-authentication/user-authentication.role';

export default Vue.extend({
    data () {
        return {
            users: [],
            postsByUser: [],
            selectedUser: {},
            selectedUserAuth: {},
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

            userActions: [
                { key: 'reset-password', text: 'Reset password' },
                { key: 'change-role', text: 'Change user role' },
                { key: 'delete-user', text: 'Delete this user' }
            ],

            showChangeRole: false,
            userRoles: ['User', 'Moderator', 'Admin'],
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
        },

        formatDate (date) {
            // TODO: Make this locale-aware
            return format(
                parse(date),
                "MMM D, YYYY, HH:mm"
            );
        },

        roleForUser (auth) {
            return UserRole[auth.role];
        },

        changeRole (role) {
            const token = this.$warehouse.get('themis_login_token');

            axios.post(`/internal/authenticate/user-role-change`, {
                username: this.selectedUser.name,
                newRole: UserRole[role]
            }, {
                headers: {'Authorization': `bearer ${token}`}
            })
            .then(response => this.selectedUserAuth = response.data)
            .catch(error => console.log(error.response));

            this.showChangeRole = false;
        },

        showUserAuthentication (user) {
            this.selectedUser = user;
            this.window = 2;

            const token = this.$warehouse.get('themis_login_token');

            axios.get(`/internal/authenticate/user-authentication/${user.name}`, {
                headers: {'Authorization': `bearer ${token}`}
            })
            .then(response => this.selectedUserAuth = response.data)
            .catch(error => console.log(error.response));
        },

        adminUserAction (action) {
            switch (action.key) {
                case 'change-role':
                    this.showChangeRole = true;
                    break;

                case 'reset-password':
                    break;
                
                case 'delete-user':
                    break;
            
                default:
                    throw new Error('Invalid selection');
            }
        }
    },
    mounted () {
        this.getAllUsers();
    }
})
</script>

<style>

</style>
