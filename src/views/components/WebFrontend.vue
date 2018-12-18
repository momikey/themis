<template>
    <div class="three-pane-view">
        <section class="groups-pane pane">
            Groups go here...
        </section>

        <div class="vertical container">
        <section class="thread-list pane">
            Threads go here...
        </section>

        <section class="current-post pane">
            Posts go here, and so does the post composer...
        </section>
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
export default Vue.extend({
    
})
</script>

<style>
    .three-pane-view {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .vertical-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .groups-pane {
        width: 30%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
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