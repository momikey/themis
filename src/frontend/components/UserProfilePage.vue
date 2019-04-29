<template>
<div>
    <!--
        As with the "main" FE page, we use a wrapper div here,
        since we'll have navigation and other components that
        might need to be outside the content.
    -->
    <v-navigation-drawer app dark
        :permanent="$vuetify.breakpoint.smAndUp"
        v-model="drawer"
    >
        <v-toolbar absolute dense dark color="primary darken-4"
            v-if="$vuetify.breakpoint.xs"
        >
            <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>

        </v-toolbar>

    </v-navigation-drawer>

    <v-toolbar app absolute dense dark color="primary darken-4"
        v-if="$vuetify.breakpoint.xs"
    >
        <v-toolbar-side-icon @click.stop="drawerClicked"></v-toolbar-side-icon>

    </v-toolbar>

    <!-- Here's the main content -->
    <v-content>
        <v-container>
            <v-layout>
                Test
            </v-layout>
        </v-container>
    </v-content>
</div>
</template>

<script lang="ts">

import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () {
        return {
            user: null,
            account: null,
            showDrawer: null,
        }
    },

    computed: {
        drawer: {
            get () {
                return this.$vuetify.breakpoint.smAndUp || this.showDrawer;
            },

            set (v) {
                this.showDrawer = v;
            }
        }
    },

    methods: {
        drawerClicked () {
            this.showDrawer = !this.showDrawer;
        }
    },

    async mounted () {
    }
})

</script>

<style>

</style>
