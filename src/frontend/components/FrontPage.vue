<template>
    <!-- <div class="front-page-container"> -->
    <v-container fluid><v-layout justify-start row fill-height wrap>
        <v-flex xs12 sm4 lg3>
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
                        @click="login">
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
            </v-layout>
            </v-container>
        </v-flex>

        <v-flex xs12 sm8 lg6 pl-2>
        <div class="front-column site-info">
            <p>Put your site's info here...</p>
            <p>(Eventually, we'll bring that in from the server.)</p>
        </div>

            <v-flex xs12 sm10 md8 offset-sm1 offset-md2 class="pt-5">
            <v-sheet dark v-if="nodeinfo"
                class="d-flex"
                color="blue-grey darken-2"
                elevation="4"
                max-height="150"
            >
                <v-card class="pr-4">
                    <v-card-title dark class="justify-end display-1">
                        {{ serverTotalUsers }}
                    </v-card-title>
                    <v-card-text class="text-uppercase text-xs-right">
                        total users
                    </v-card-text>
                </v-card>

                <v-card class="pr-4">
                    <v-card-title dark class="justify-end display-1">
                        {{ serverTotalPosts }}
                    </v-card-title>
                    <v-card-text class="text-uppercase text-xs-right">
                        total posts
                    </v-card-text>
                </v-card>
            </v-sheet>
            </v-flex>
        </v-flex>

        <v-flex xs12 lg3>
            <v-toolbar dark>
                <v-spacer />
                <v-toolbar-title>What we're talking about</v-toolbar-title>
            </v-toolbar>
            <v-list three-line>
                <v-list-tile avatar v-for="group in groupList" :key="group.id">                    
                    <v-list-tile-content>
                        <v-list-tile-title>{{ group.displayName }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ formatGroupName(group) }}</v-list-tile-sub-title>
                        <v-list-tile-action-text>{{ group.summary }}</v-list-tile-action-text>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-flex>
    </v-layout>

    <site-footer/>

    <!-- Popup for invalid account info -->
    <v-snackbar bottom left
        v-model="invalidLogin"
        color="error"
        :timeout="5000"
    >
        {{ invalidLoginText }}
    <v-btn dark flat
        @click = 'invalidLogin = false'
    >
        Close
    </v-btn>
    </v-snackbar>

    <!-- Popup for successful account creation -->
    <v-snackbar bottom left
        v-model="createdAccount.flag"
        color="success"
        :timeout="5000"
    >
        {{ createdAccount.message }}
    <v-btn dark flat
        @click = 'createdAccount.flag = false'
    >
        Close
    </v-btn>
    </v-snackbar>

    </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import axios from 'axios'
import * as httpStatus from 'http-status';
import { FrontendService } from '../frontend.service';

import SiteFooter from './SiteFooter.vue';

export default Vue.extend({
    data () {
        return {
            nodeinfo: {},
            groupList: [],

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
            invalidLoginText: '',

            createdAccount: {
                flag: false,
                message: ''
            }
        }
    },
    computed: {
        serverTotalUsers() {
            if (this.nodeinfo.usage) {
                return FrontendService.formatNumber(this.nodeinfo.usage.users.total);
            } else {                
                return "...";
            }
        },

        serverTotalPosts() {
            if (this.nodeinfo.usage) {
                return FrontendService.formatNumber(this.nodeinfo.usage.localPosts);
            } else {
                return "...";
            }
        },

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
        async getNodeinfo() {
            try {
                this.nodeinfo = (await FrontendService.getNodeinfo()).data;
            } catch (e) {
                console.log(`Error fetching nodeinfo: ${e}`);
            }
        },

        async getGroupList() {
            try {
                this.groupList = (await FrontendService.getGroupList()).data;
            } catch (e) {
                console.log(`Error fetching group list: ${e}`);
            }
        },

        async login() {
            try {
                // Try to log in. If there are any errors (wrong password,
                // wrong username, etc.), then we'll deal with them below.
                const loginResponse = (await FrontendService.login(
                    this.loginName, this.loginPassword)).data;

                this.invalidLogin = false;

                // Logging in returns an API token, which we'll use
                // throughout the frontend.
                // TODO: Have a way to refresh the token.
                this.$warehouse.set('themis_login_token', loginResponse.accessToken);
                this.$warehouse.set('themis_login_user', this.loginName);

                // Get the role for this user, to store for later.
                // This will determine whether the user can access
                // the admin panel, create groups, etc.
                const userRole = (await FrontendService.getUserRole(
                    this.loginName, loginResponse.accessToken
                )).data;

                this.$warehouse.set('themis_login_role', userRole);
                this.$router.push('web');
            } catch (e) {
                // Something went wrong with one of the two API calls.
                // Either way, it's technically a login failure.
                this.invalidLogin = true;

                if (e.response.status == httpStatus.UNAUTHORIZED) {
                    // 401 Unauthorized means the user did not enter
                    // the correct username or password. For security
                    // reasons, we're not supposed to tell them which.
                    this.invalidLoginText = "Invalid username or password";
                }
            }
        },

        validateAccount() {
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

        async createAccount() {
            const validationResult = this.validateAccount();

            if (!validationResult.isValid) {
                // Something went wrong, so let the user know.
                console.log(validationResult.reason);
            } else {
                // Looks like we're good. The back end can handle it from here.
                // axios.post('/internal/authenticate/create-account', this.newAccount)
                // .then(response => console.log(response.data))
                // .catch(error => console.log(error));
                try {
                    const createResponse =
                        (await FrontendService.createAccount(this.newAccount)).data;

                    this.createdAccount.flag = true;
                    this.createdAccount.message =
                        `Successfully created account "${this.newAccount.username}"`;
                } catch (e) {
                    if (e.response.status == httpStatus.BAD_REQUEST) {
                        this.invalidLogin = true;
                        this.invalidLoginText = e.repsonse.message;
                    }
                }
            }
        },

        cancelCreate() {
            this.isCreating = false;
        },

        showCreateForm() {
            this.isCreating = true;
        },

        formatGroupName(group) {
            const address = `@${group.name}@${FrontendService.prettyServer(group.server)}`
            return address;
        }
    },
    async mounted() {
        await this.getNodeinfo();
        await this.getGroupList();
    },
    components: {
        SiteFooter
    },
})
</script>

<style>

</style>