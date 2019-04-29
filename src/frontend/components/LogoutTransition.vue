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
        logout() {
            this.$warehouse.set('themis_login_user', null);
            this.$warehouse.set('themis_login_token', null);
            this.$warehouse.set('themis_login_role', null);
        },

        redirect() {
            this.$router.replace('/');
        },
    },

        mounted() {
        setTimeout(() => {
            this.logout();
            this.redirect();
        }, 3000);
    }
})

</script>

<style>

</style>
