<template>
    <!-- <div class="front-page-container"> -->
    <v-container fluid><v-layout justify-start row fill-height wrap>
        <v-flex xs3>
        <div class="front-column login">
            <v-container fluid><v-layout justify-start column fill-height>
                <v-window
                    class="login-or-create"
                    v-model="isCreating"
                >
                    <v-window-item :value="false" reverse="true">
                    <v-form class="existing-account" v-if="!isCreating" key="existing">
                    <v-text-field 
                        id="login-name" 
                        name="login-name" 
                        label="Username" 
                        v-model="loginName"
                    />
                    <v-text-field 
                        id="login-password" 
                        name="login-password" 
                        type="password" 
                        label="Password" 
                        v-model="loginPassword"
                    />
                    <br />
                    <v-btn color="orange darken-4"
                        id="login-submit"
                        class="button login"
                        @click="loginSubmit">
                        Log in
                    </v-btn>
                    <v-btn
                        id="create-new-account"
                        class="button submit"
                        @click="showCreateForm">
                        Create account
                    </v-btn>
                    <p id="login-invalid" v-if="invalidLogin">Invalid username or password</p>
                    </v-form>
                    </v-window-item>

                    <v-window-item :value="true">
                    <v-form class="new-account" v-if="isCreating" key="new">
                        <v-text-field
                            id="new-name"
                            name="new-name"
                            label="Username"
                            v-model="newAccount.username"
                            :rules="newAccountRules.name"
                        />
                        <v-text-field
                            id="new-email"
                            name="new-email"
                            label="Email address"
                            v-model="newAccount.email"
                            :rules="newAccountRules.email"
                        />
                        <v-text-field
                            id="new-password"
                            name="new-password"
                            type="password"
                            label="Password"
                            v-model="newAccount.password"
                            :rules="newAccountRules.password"
                        />
                        <v-text-field
                            id="new-retype"
                            name="new-retype"
                            type="password"
                            label="Retype password"
                            v-model="retypePassword"
                            :rules="newAccountRules.retype"
                        />
                        <br />
                        <v-btn color="orange darken-4"
                            id="new-account-submit"
                            class="button submit"
                            @click="createAccount">
                            Create account
                        </v-btn>
                        <v-btn
                            id="new-account-cancel"
                            class="button cancel"
                            @click="cancelCreate">
                            Cancel
                        </v-btn>
                        <p id="new-account-invalid-reason" :class="isAccountValid">{{validateAccount().reason}}</p>
                    </v-form>
                    </v-window-item>
                </v-window>
            </v-layout></v-container>
        </div>
        </v-flex>

        <v-flex xs9 pl-2>
        <div class="front-column site-info">
            <p>Put your site's info here...</p>
        </div>
        </v-flex>
    <!-- </div> -->
    </v-layout></v-container>
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

            invalidLogin: false,
        }
    },
    computed: {
        passwordsMatch: function () {
            return this.newAccount.password && 
                this.newAccount.password === this.retypePassword;
        },

        isAccountValid: function () {
            return (this.validateAccount().isValid ? "account-valid" : "account-invalid");
        },

        newAccountRules () {
            return {
                name: [
                    // TODO: Make real validation logic here,
                    // most likely pulling something from the server.
                    v => !!v || "Username is required",
                    v => !/[^A-Za-z0-9_-]/.test(v) || "Only alphanumeric characters, -, and _ are allowed"
                ],
                email: [
                    // TODO: Don't even get me started on email validation...
                    v => !!v || "Email address is required",
                    v => /.+@.+/.test(v) || "Email address must be valid"
                ],
                password: [
                    // TODO: Real password verification, with server rules,
                    // strength checking, and all that fun stuff.
                    v => !!v || "You must provide a password",
                    v => v.length >= 6 || "Password must be at least 6 characters"
                ],
                retype: [
                    v => this.newAccount.password && 
                    this.newAccount.password === this.retypePassword || "Passwords must match"
                ]
            }
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
            axios.post('/internal/authenticate/login', {
                username: this.loginName,
                password: this.loginPassword
            })
            .then(response => {                
                this.$warehouse.set('themis_login_token', response.data.accessToken);
                this.$warehouse.set('themis_login_user', this.loginName);
                this.invalidLogin = false;

                // Very hacky, but I don't want to set up a whole router just for this,
                // and the back end is giving me trouble.
                axios.get('/internal/authenticate/post-login', {
                    headers: { "Authorization": `Bearer ${this.$warehouse.get('themis_login_token')}` }
                })
                // .then(response => location.assign(response.data))
                .then(response => this.$router.push('web'))
                .catch(error => console.log(error.response));
            })
            .catch(error => {               
                if (error.response.status === 403) {
                    // 403 Forbidden
                    this.invalidLogin = true;
                }
            });
        },

        showCreateForm: function () {
            this.isCreating = true;
        }
    }
})
</script>

<style>

</style>