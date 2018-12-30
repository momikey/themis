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
                    <input
                        id="new-name"
                        name="new-name"
                        placeholder="Username"
                        v-model="newAccount.username"
                    />
                    <input
                        id="new-email"
                        name="new-email"
                        placeholder="Email address"
                        v-model="newAccount.email"
                    />
                    <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        placeholder="Password"
                        v-model="newAccount.password"
                    />
                    <input
                        id="new-retype"
                        name="new-retype"
                        type="password"
                        placeholder="Retype password"
                        v-model="retypePassword"
                    />
                    <br />
                    <button id="new-account-submit" class="button submit" @click="createAccount">Create account</button>
                    <button id="new-account-cancel" class="button cancel" @click="cancelCreate">Cancel</button>
                    <p id="new-account-invalid-reason" :class="isAccountValid">{{validateAccount().reason}}</p>
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
            loginPassword: '',

            newAccount: {
                username: '',
                email: '',
                password: '',
            },
            retypePassword: '',
        }
    },
    computed: {
        passwordsMatch: function () {
            return this.newAccount.password && 
                this.newAccount.password === this.retypePassword;
        },

        isAccountValid: function () {
            return (this.validateAccount().isValid ? "account-valid" : "account-invalid");
        }
    },
    methods: {
        validateAccount: function () {
            // A potential account must have all parts valid.
            // Of course, we'll eventually need to do a lot of checking to see
            // if e.g., passwords are secure, the username isn't duplicated,
            // and all those things like that.

            // A number of things can go wrong here, so we'll use an object
            // to hold both the positive/negative result and an explanation
            // of what, if anything, went wrong.
            const result = {
                isValid: false,
                reason: ''
            }

            if (!this.passwordsMatch) {
                result.reason = "Passwords don't match (retype password correctly)";
            }

            if (!this.newAccount.password) {
                result.reason = "You must enter a password";
            }

            if (!this.newAccount.email.includes('@')) {
                result.reason = "Email address is not valid (doesn't contain @)";
            }

            if (!result.reason) {
                // We made it here without errors, so we must be okay.
                result.isValid = true;
                result.reason = "You're good to go";
            }

            return result;
        },

        createAccount: function () {
            const validationResult = this.validateAccount();

            if (!validationResult.isValid) {
                // Something went wrong, so let the user know.
                console.log(validationResult.reason);
            } else {
                // Looks like we're good. The back end can handle it from here.
                axios.post('/internal/authenticate/create-account', this.newAccount)
                .then(response => console.log(response.data))
                .catch(error => console.log(error));
            }
        },

        cancelCreate: function () {
            this.isCreating = false;
        },

        loginSubmit: function () {
            // TODO: Temp method
            // axios.post('/internal/authenticate/create-token', {
            //     username: this.loginName
            // })
            // .then(response => console.log(response.data.accessToken))
            // .catch(error => console.log(error));
            axios.post('/internal/authenticate/login', {
                username: this.loginName,
                password: this.loginPassword
            })
            .then(response => console.log(response.data))
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

    .account-valid {
        color: darkgreen;
    }

    .account-invalid {
        color: darkred;
    }
</style>
