<template>
    <div class="user-list-container">
        <section class="user-entry" v-for="user in users" :key="user.id">
        <details class="user-details">
            <summary class="user-summary">
                <span class="internal-name">{{formatUserName(user)}}</span>
                <span class="display-name">({{user.displayName}})</span>
            </summary>
            <div class='user-info'>
                <p>
                    <span class="user-info-label">Server:</span>
                    <span class='user-info-data'>{{user.server}}</span>
                </p>
                <p>
                    <span class="user-info-label">Summary:</span>
                    <span class='user-info-data'>{{user.summary}}</span>
                </p>
                <p>
                    <span class="user-info-label">Icon URI:</span>
                    <span class='user-info-data'><a :href="user.icon">{{user.icon}}</a></span>
                </p>
                <p>
                    <span class="user-info-label">Created on:</span>
                    <span class='user-info-data'>{{user.date}}</span>
                </p>
            </div>
        </details>
        <div class="user-buttons">
            <button class="user-button edit" @click="editUser(user)">Edit</button>
            <button class="user-button delete" @click="deleteUser(user)">Delete</button>
        </div>
        </section>
        <component
            :is="editForm"
            :initialObject="initial"
            :initialName="initial.name"
            :initialDisplay="initial.displayName"
            :initialSummary="initial.summary"
            :initialIconUrl="initial.iconUrl"
        />
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'
import UserCreate from './AdminUserCreate.vue'

export default Vue.extend({
    data () {
        return {
            users: [],
            hasChanged: false,
            editingUser: 0
        }
    },
    computed: {
        editForm: function () {
            return (this.editingUser) ? "user-create" : '';
        },
        initial: function () {
            return (this.editingUser !== 0) ? this.users[this.editingUser] : {};
        }
    },
    watch: {
        users: function (newValue, oldValue) {
            if (this.hasChanged) {
                this.getUserList();
                this.hasChanged = false;
            }
        }
    },
    methods: {
        formatUserName: function (user) {
            return `@${user.name}`;
        },
        editUser: function (user) {
            this.editingUser = user.id;
        },
        deleteUser: function (user) {
            console.log(user);
        },
        getUserList: function () {
        axios.get("/internal/users")
            .then(response => (this.users = response.data))
            .catch(error => console.log(error));

        },
        onChange: function () {
            this.hasChanged = true;
        }
    },
    mounted () {
        this.getUserList();
    },
    components: {
        UserCreate
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