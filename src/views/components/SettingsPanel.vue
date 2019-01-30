<template>
    <v-layout>
        <v-flex xs4>
            <v-navigation-drawer
                permanent
                absolute
                dark
            >
                <!-- Navigation header -->
                <v-toolbar flat>
                    <v-list>
                        <v-list-tile>
                            <!-- TODO: Avatar? -->
                            <v-list-tile-content>
                                {{ userName }}
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-toolbar>

                <!-- Navigation elements -->
                <v-list>
                    <v-list-tile
                        v-for="item in navigationItems"
                        :key="item.title"
                        @click="navigate(item)"
                    >
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>{{ item.text }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-navigation-drawer>
        </v-flex>

        <v-flex xs8>
            <router-view></router-view>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'

export default Vue.extend({
    data () {
        return {
            navigationItems: [
                { text: 'Profile', route: 'profile', icon: 'person' },
                { text: 'Prefernences', route: 'preferences', icon: 'settings' },
                { text: 'Filters', route: 'filters', icon: 'filter_list' },
                { text: 'Exit', route: 'exit', icon: 'arrow_back' }
            ]
        }
    },
    props: ['userName'],
    methods: {
        navigate (target) {
            this.$router.push(`/settings/${target.route}`);
        }
    }
})
</script>

<style>

</style>
