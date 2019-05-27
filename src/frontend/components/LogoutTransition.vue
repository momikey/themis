<template>
    <!--
        Simple "transition" page for logging out.
        All it does is remove the login token from
        local storage and redirect to the front page.
    -->
    <p class="headline">{{ logoutLabel }}</p>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    data () {
        return {
            logoutLabel: "Logging out...",
        }
    },

    methods: {
        /*
         * Log the user out by removing their name, role, and API
         * token from browser storage. If we add in session stuff
         * later on, this would handle it, too.
         */
        logout() {
            this.$warehouse.set('themis_login_user', null);
            this.$warehouse.set('themis_login_token', null);
            this.$warehouse.set('themis_login_role', null);
        },

        /*
         * Redirect the user after logging out. This uses the
         * `replace()` method rather than `push()` because we
         * *want* to alter the browser history stack.
         */
        redirect() {
            this.$router.replace('/');
        },
    },

    mounted() {
        // TODO: Maybe change the countdown here, or make it
        // a server setting?
        setTimeout(() => {
            this.logout();
            this.redirect();
        }, 3000);
    }
})

</script>

<style>

</style>
