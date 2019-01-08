<template>
    <v-treeview
        class="thread-list-container"
        v-model="tree"
        :items="threads"
        item-text="subject"
        activatable
        :active.sync="active"
        :open.sync="open"
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
            open: [],
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

                    // const post = this.threads.find(e => e.id === ids[0]);
                    const post = this.findPostById(ids[0]);
                    this.$emit('thread-selected', post);
                }
            }
        }
    },
    watch: {
        group (newVal, oldVal) {
            this.retrievePosts();
        },

        open (newVal, oldVal) {
        }
    },
    methods: {
        formatSender (sender) {
            // TODO: add formatting, like with groups
            return `${sender.displayName || sender.name}`;
        },
        retrievePosts () {
            if (this.group) {
                axios.get(`/internal/groups/get-top-level-posts/${this.group.name}`)
                    .then(async response => {
                        this.threads = await Promise.all(
                            response.data.map(p => this.loadPost(p))
                        );
                        // this.threads.forEach(e => e.children = []);
                    })
                    .catch(error => console.log("Retrieve posts error:", error));
            }
        },
        formatDate (date) {
            return distanceInWordsToNow(parse(date));
        },
        loadPost (post) {
            if (post) {
                const p = axios.get(`/internal/posts/get/${post.uuid}`);

                return (p
                    .then(response => response.data)
                    .catch(error => console.log("Load posts error:", error))
                );
            }
        },
        findPostById (id, collection) {
            if (collection === undefined) {
                collection = this.threads;
            } else if (collection === []) {
                return null;
            }

            for (const p of collection) {
                const result = this._treeSearch(id, p);
                if (result) {
                    return result;
                }
            }

            return null;
        },
        _treeSearch (target, tree) {
            if (tree.id === target) {
                return tree;
            } else if (tree.children.length) {
                for (const c of tree.children) {
                    if (this._treeSearch(target, c)) {
                        return c;
                    }
                }
            } else {
                return null;
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
