<template>
    <div class="user-list-container">
        <details class="user-entry" v-for="user in users" :key="user.id">
            <summary class="user-summary">
                <span class="internal-name">{{formatUserName(user)}}</span>
                <span class="display-name">({{user.displayName}})</span>
            </summary>
            <ul class='user-info'>
                <li>Server:<span class='user-info-data'>{{user.server}}</span></li>
                <li>Summary:<span class='user-info-data'>{{user.summary}}</span></li>
                <li>Icon URI:<span class='user-info-data'><a :href="user.icon">{{user.icon}}</a></span></li>
                <li>Created on:<span class='user-info-data'>{{user.date}}</span></li>
            </ul>
        </details>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import axios from 'axios';

export default Vue.extend({
    data () {
        return {
            users: []
        }
    },
    methods: {
        formatUserName: function (user) {
            return `@${user.name}`;
        }
    },
    mounted () {
        axios.get("/internal/users")
            .then(response => (this.users = response.data))
            .catch(error => console.log(error));
    }
})
</script>


<style>
    .user-info-data {
        padding-left: 1ex;
    }
</style>