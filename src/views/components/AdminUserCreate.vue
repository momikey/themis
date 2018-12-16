<template>
    <div class="user-create-form">
        <label for="user-name">Name:</label>
        <input id="user-name" type="text" placeholder="user name" v-model="name" />
        <br />

        <label for="user-display-name">Display name:</label>
        <input id="user-display-name" type="text" placeholder="preferred display name" v-model="displayName" />
        <br />

        <label for="user-summary">Summary:</label>
        <input id="user-summary" type="text" placeholder="brief summary for the user" v-model="summary" />
        <br />

        <button @click="submit">Submit</button>
        <button @click="clear">Clear </button>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            name: this.initialName || '',
            displayName: this.initialDisplay || '',
            summary: this.initialSummary || '',
            iconUrl: this.initialIconUrl || ''
        }
    },
    props: ['initialObject', 'initialName', 'initialDisplay', 'initialSummary', 'initialIconUrl'],
    methods: {
        clear: function () {
            this.name = '';
            this.displayName = '';
            this.summary = '';
            this.iconUrl = '';
        },
        submit: function () {
            if (this.initialObject) {
                throw new Error("Updating not yet implemented");
            }

            axios.post('/internal/users', {
                name: this.name,
                displayName: this.displayName,
                summary: this.summary,
                iconUrl: this.iconUrl
            })
            .then(response => console.log(response))
            .catch(error => console.log(error));
        }
    }
})
</script>

<style>
    .user-create-form {
        /* line-height: 1.5; */
    }
</style>
