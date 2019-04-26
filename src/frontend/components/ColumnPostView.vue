<template>
    <v-layout column justify-start class="scroll-y post-view-layout">
        <v-flex class="mb-0 pb-0">
            <v-card dark>
                <v-card-title v-if="post">
                    <h1 class="title">{{ post.subject }}</h1>
                </v-card-title>
            </v-card>
        </v-flex>
        <v-flex>
            <post-tree-node v-if="post" :post="post" />
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

import { FrontendService } from '../frontend.service';
import PostTreeNode from './PostTreeNode.vue';

export default Vue.extend({
    data() {
        return {
            parentPost: null
        }
    },

    props: [
        'post',
        'reload'
    ],

    watch: {
        post () {
            this.$emit('update-progress', 100);
        },
    },

    methods: {
        replyTo(post, reply) {
            this.$emit('create-reply', post, reply);
        },
    },

    provide() {
        return {
            replyTo: this.replyTo,
        }
    },

    async mounted() {
        this.$emit('update-progress', 100);
    },

    components: {
        PostTreeNode
    }
})

</script>

<style>
    .post-view-layout {
        /* account for padding */
        max-height: calc(100vh - 72px);
    }
</style>
