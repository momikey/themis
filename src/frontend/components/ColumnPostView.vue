<template>
    <v-layout column justify-start fill-height>
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
        'post'
    ],

    methods: {
        replyTo(post, reply) {
            console.log(post.id, reply);
            
        },
    },

    provide() {
        return {
            replyTo: this.replyTo,
        }
    },

    async mounted() {
        
    },

    components: {
        PostTreeNode
    }
})

</script>

<style>

</style>
