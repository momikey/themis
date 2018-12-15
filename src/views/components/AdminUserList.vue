<template>
    <div class="user-list-container">
        <section class="user-entry" v-for="user in users" :key="user.id">
        <details class="user-details">
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
        <div class="user-buttons">
            <button class="user-button edit" @click="editUser(user)">Edit</button>
            <button class="user-button delete" @click="deleteUser(user)">Delete</button>
        </div>
        </section>
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
        },
        editUser: function (user) {
            console.log(user);
            
        },
        deleteUser: function (user) {
            console.log(user);

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
    .user-entry {
        display: flex;
        border: none;
        background-color: aliceblue;
    }

    .user-details {
        /* align-self: center; */
        padding: 1em;
    }

    .user-summary {
        vertical-align: middle;
    }

    .user-buttons {
        margin-left: auto;
        margin-top: .5em;
        margin-bottom: .5em;
    }

    .user-info-data {
        margin-left: 1ex;
    }
</style>