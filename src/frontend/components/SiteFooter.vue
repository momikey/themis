<template>    
    <v-footer absolute app class="pa-2">
        <v-spacer/>
        <div>This site proudly runs {{ serverVersionString }}.</div>
    </v-footer>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { FrontendService } from '../frontend.service';

export default Vue.extend({
    data() {
        return {
            nodeinfo: {},
        }
    },
    computed: {
        serverVersionString() {
            if (this.nodeinfo.software) {
                return `Themis v${this.nodeinfo.software.version}`;
            } else {
                return 'Loading version information...';
            }
        },
    },
    methods: {
        async getNodeinfo() {
            try {
                this.nodeinfo = (await FrontendService.getNodeinfo()).data;
            } catch (e) {
                console.log(`Error fetching nodeinfo: ${e}`);
            }
        },
    },
    async mounted() {
        await this.getNodeinfo();
    }
})
</script>

<style>

</style>
