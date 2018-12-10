<template>
    <a class="group-list-entry" @click="$emit('group-clicked', internalName)">
        <span class="group-list-name">{{displayName}}</span>
        <span class="group-list-internal">({{internalName}})</span>
    </a>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'

export default Vue.extend({
    props: ['display', 'internal'],
    data () {
        return {
            displayName: this.display,
            internalName: this.internal
        }
    },
})
</script>

<style>

</style>
