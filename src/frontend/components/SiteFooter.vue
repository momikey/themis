<template>
    <!-- The site footer, aka the only branding Themis will have -->
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
        /*
         * Format the version string. Note that only the "loading" text
         * should be localized. Themis stays Themis no matter what the
         * user's locale.
         */
        serverVersionString() {
            if (this.nodeinfo.software) {
                return `Themis v${this.nodeinfo.software.version}`;
            } else {
                return 'Loading version information...';
            }
        },
    },
    methods: {
        /*
         * Get the server's Nodeinfo.
         * TODO: Can we pass the one from the front page?
         */
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
