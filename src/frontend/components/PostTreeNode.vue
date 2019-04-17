<template>
    <v-card dark flat class="pl-2">
        <v-card-title>{{ thePost.subject }}</v-card-title>
        <v-card-text>{{ thePost.content }}</v-card-text>

        <post-tree-node v-for="child in thePost.children" :key="child.id"
            :post="child"
        />
    </v-card>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

import { FrontendService } from '../frontend.service';

export default Vue.extend({
    name: 'post-tree-node',

    data() {
        return {
            thePost: this.post,
        }
    },

    props: [
        'post'
    ],

    watch: {
        async post () {
            await this.loadPost();
        }
    },

    methods: {
        async loadPost () { 
            if (this.post.children) {
                this.thePost = this.post;
            } else {
                this.thePost = (await FrontendService.getFullPost(this.post)).data;
            }
        }
    },
    
    async mounted () {
        await this.loadPost();
    }
})
</script>

<style>

</style>
