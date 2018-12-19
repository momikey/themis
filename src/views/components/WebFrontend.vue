<template>
    <div class="three-pane-view">
        <section class="groups-pane pane">
            <header>
                <h1>All known groups</h1>
            </header>

            <group-list class="groups-list-container"
                @group-selected="groupSelected"
            />

            <footer>
                <button>Create new group</button>
            </footer>
        </section>

        <div class="vertical container">
        <section class="thread-list pane">
            {{threadPaneText}}
        </section>

        <section class="current-post pane">
            {{currentPostText}}
        </section>
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import GroupList from './GroupList.vue'

export default Vue.extend({
    data () {
        return {
            threadPaneText: "No group selected",
            currentPostText: "",
        }
    },
    methods: {
        groupSelected (group) {
            this.threadPaneText = group;
        }
    },
    components: {
        GroupList
    }
})
</script>

<style>
    .three-pane-view {
        display: flex;
        align-items: stretch;
        width: 100%;
        height: 100%;
    }

    .vertical-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: stretch;
    }

    .groups-pane {
        width: 30%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    .groups-list-container {
        flex-grow: 1;
    }

    .pane > footer {
        padding-bottom: 1em;
    }

    .pane > header, .pane > .groups-list-container, .pane > footer {
        flex-shrink: 0;
    }

    .thread-list {
        min-height: 40%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .current-post {
        flex-grow: 1;
    }
</style>