<template>
    <div class="themis-admin-panel">
        <div class="actions">
            <section class="user">
                <p v-for="u in actions.user" :key="u[0]">
                    <button class="action-button" @click="handleClick(u[0])">{{u[1]}}</button>
                </p>
            </section>

            <section class="group">
                <p v-for="g in actions.group" :key="g[0]">
                    <button class="action-button" @click="handleClick(g[0])">{{g[1]}}</button>
                </p>
            </section>

            <section class="post">
                <p v-for="p in actions.post" :key="p[0]">
                    <button class="action-button" @click="handleClick(p[0])">{{p[1]}}</button>
                </p>
            </section>

            <section class="other">
                <p v-for="o in actions.other" :key="o[0]">
                    <button class="action-button" @click="handleClick(o[0])">{{o[1]}}</button>
                </p>
            </section>
        </div>

        <div class="current-action">
            <component
                :is="currentComponent"
                class="component"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import UserList from './AdminUserList.vue'
import UserCreate from './AdminUserCreate.vue'
import GroupList from './AdminGroupList.vue'

export default Vue.extend({
    data () {
        return {
            lastResult: null,
            actions: {
                'user': [
                    ['user-list', 'Show All Users'],
                    ['user-create', 'Create User'],
                    ['user-edit', 'Edit User'],
                    ['user-delete', 'Delete User'],
                    ['user-profile', 'Show User Profile'],
                    ['user-ban', 'Ban User']
                ],
                'group': [
                    ['group-list', 'Show All Groups'],
                    ['group-create', 'Create Group'],
                    ['group-edit', 'Group Edit'],
                    ['group-show', "Show Group"],
                    ['group-delete', 'Delete Group'],
                ],
                'post': [
                    ['post-list', 'Show All Posts'],
                    ['post-create', 'Create Post'],
                    ['post-show', 'Show Post'],
                    ['post-delete', 'Delete Post']
                ],
                'other': [
                    ['panel-exit', 'Exit Admin Panel']
                ]
            }
        }
    },
    computed: {
        currentComponent: function () {
            if (this.lastResult) {
                return this.lastResult;
            } else {
                return undefined;
            }
        }
    },
    methods: {
        handleClick: function (b) {
            this.lastResult = b;
        }
    },
    components: {
        UserList,
        UserCreate,
        GroupList
    }
})
</script>

<style>
    .themis-admin-panel {
        display: flex;
        width: 100%;
        height: 100%;
    }
    .actions {
        border: 1px solid;
        width: 25%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .current-action {
        border: 2px solid;
        width: 75%;
        padding: 1em;
    }
    
    section {
        margin: 1em;
        border: 1px solid;
    }
    button.action-button {
        margin-left: 5%;
        margin-right: 5%;
        width: 90%;
        min-height: 3em;
    }

</style>
