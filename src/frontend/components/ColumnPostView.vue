<template>
    <post-tree-node v-if="post" :post="post" />
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
