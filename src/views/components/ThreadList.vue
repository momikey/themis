<template>
    <v-treeview
        class="thread-list-container"
        v-model="tree"
        :items="threads"
        item-text="subject"
        activatable
        :active.sync="active"
    >
        <template slot="label" slot-scope="{ item }">
            <v-layout row justify-space-between>
                <v-flex xs8>
                <span>{{item.subject}}</span>
                </v-flex>

                <v-flex xs2>
                <span>{{formatSender(item.sender)}}</span>
                </v-flex>

                <v-flex xs2>
                <span>{{formatDate(item.timestamp)}}</span>
                </v-flex>
            </v-layout>
        </template>
    </v-treeview>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'
import { distanceInWordsToNow, parse } from 'date-fns';

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
            return `${sender.displayName || sender.name}`;
        },
        retrievePosts () {
            if (this.group) {
                axios.get(`/internal/posts/by-group/${this.group.name}`)
                    .then(response => this.threads = response.data)
                    .catch(error => console.log(error));
            }
        },
        formatDate (date) {
            return distanceInWordsToNow(parse(date));
        }
    },
    mounted () {
        this.retrievePosts();
    }
})
</script>

<style>

</style>
