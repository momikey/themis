<template>
    <div class="front-page-container">
        <div class="front-column login">
            <section class="account-box">
            <transition name="slide-left" mode="out-in">
                <div class="existing-account" v-if="!isCreating" key="existing">
                    <input 
                        id="login-name" 
                        name="login-name" 
                        placeholder="Username" 
                        v-model="loginName"
                    />
                    <input 
                        id="login-password" 
                        name="login-password" 
                        type="password" 
                        placeholder="Password" 
                        v-model="loginPassword"
                    />
                    <br />
                    <button id="login-submit" class="button login" @click="loginSubmit">Log in</button>
                    <button id="create-new-account" class="button submit" @click="showCreateForm">Create account</button>
                </div>
                <div class="new-account" v-if="isCreating" key="new">
                    <input id="new-name" name="new-name" placeholder="Username" />
                    <input id="new-email" name="new-email" placeholder="Email address" />
                    <input id="new-password" name="new-password" type="password" placeholder="Password" />
                    <input id="new-retype" name="new-retype" type="password" placeholder="Retype password" />
                    <br />
                    <button id="new-account-submit" class="button submit" @click="createAccount">Create account</button>
                    <button id="new-account-cancel" class="button cancel" @click="cancelCreate">Cancel</button>
                </div>
            </transition>
            </section>
        </div>

        <div class="front-column site-info">
            <p>Put your site's info here...</p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'

export default Vue.extend({
    data () {
        return {
            isCreating: false,

            loginName: '',
            loginPassword: ''
        }
    },
    methods: {
        createAccount: function () {

        },

        cancelCreate: function () {
            this.isCreating = false;
        },

        loginSubmit: function () {
            // TODO: Temp method
            axios.post('/internal/authenticate/create-token', {
                username: this.loginName
            })
            .then(response => console.log(response.data.accessToken))
            .catch(error => console.log(error));
        },

        showCreateForm: function () {
            this.isCreating = true;
        }
    }
})
</script>

<style>
    .front-page-container {
        display: flex;
    }

    .front-column.login {
        width: 33%;
    }

    .front-column.site-info {
        flex-grow: 1;
    }

    .slide-left-enter-active, .slide-right-enter-active {
        transition: all .1s linear;
    }

    .slide-left-leave-active, .slide-right-leave-active {
        transition: all .1s linear;
    }

    .slide-left-enter, .slide-left-leave-to {
        transform: translateX(-100px);
        opacity: 0;
    }

    .slide-right-enter, .slide-right-leave-to {
        transform: translateX(100px);
        opacity: 0;
    }

</style>
