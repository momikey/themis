<template>
    <v-treeview
        class="thread-list-container"
        v-model="tree"
        :items="threads"
        item-text="subject"
        activatable
        :active.sync="active"
    >
        <template slot="prepend" slot-scope="{ item }">
            <span>{{item.timestamp}}</span>
        </template>

        <template slot="append" slot-scope="{ item }">
            <span v-html="formatSender(item.sender)"></span>
        </template>

        <!-- <ul v-if="threads.length">
            <li class="thread-entry"
                v-for="thread in threads"
                :key="thread.id"
                @click="$emit('thread-selected', thread)"
            >
                <span class="post-subject">{{thread.subject}}</span>
                <span class="post-sender" v-html="formatSender(thread.sender)"></span>
                <span class="post-date">{{thread.date}}</span>
            </li>
        </ul>
        <p v-else>
            {{noThreadsText}}
        </p> -->
    </v-treeview>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            threads: [],
            tree: [],
            _active: null,
            noThreadsText: "No posts in this group. Create one or choose another group."
        }
    },
    props: [
        'group'
    ],
    computed: {
        visibleThreads () {
            // TODO: add filtering, etc.
            return this.threads;
        },
        active: {
            get: function () {
                return this._active;
            },
            set: function (ids) {
                if (ids.length) {
                    this._active = ids[0];

                    const post = this.threads.find(e => e.id === ids[0]);
                    this.$emit('thread-selected', post);
                }
            }
        }
    },
    watch: {
        group (newVal, oldVal) {
            this.retrievePosts();
        }
    },
    methods: {
        formatSender (sender) {
            // TODO: add formatting, like with groups
            return `by <span class="display-name">${sender.displayName}</span><span class="internal-name">(${sender.name})</span>`;
        },
        retrievePosts () {
            if (this.group) {
                axios.get(`/internal/posts/by-group/${this.group.name}`)
                    .then(response => this.threads = response.data)
                    .catch(error => console.log(error));
            }
        }
    },
    mounted () {
        this.retrievePosts();
    }
})
</script>

<style>

</style>
