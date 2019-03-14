<template>
    <v-data-table
        :headers="headers"
        :items="posts"
        class="elevation-1"
    >
        <template slot="no-data">
            <v-alert :value="true" color="error" icon="warning">
                No posts to display in group {{group.name}}
            </v-alert>
        </template>

        <template slot="items" slot-scope="props">
            <tr @click="props.expanded = !props.expanded">
                    <td>{{ props.item.id }}</td>
                    <td>{{ props.item.sender && props.item.sender.name}}</td>
                    <td>{{ formatServer(props.item.server) }}</td>
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
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

import { formatServer } from '../../server/format-server'

export default Vue.extend({
    data () {
        return {
            posts: [],

            headers: [
                { text: 'ID', value: 'id' },
                { text: 'User', value: 'sender.name' },
                { text: 'Server', value: 'server' },
                { text: 'Subject', value: 'suvject' },
                { text: 'Date', value: 'timestamp' },
                { text: 'Deleted?', value: 'deleted' },
                { text: 'Content', value: 'content' }
            ]
        }
    },
    props: [ 'group' ],
    methods: {
        getPostsInGroup (group) {            
            axios.get(`/internal/posts/all-in-group/${group.id}`)
            .then(response => {
                this.posts = response.data;
                return response;
            })
            .catch(error => console.log(error));
        },

        // Delegate, because Vue won't let use imports for some reason
        formatServer (server) {
            return formatServer(server);
        }
    },
    mounted () {
        this.getPostsInGroup(this.group);
    }
})
</script>

<style>

</style>
