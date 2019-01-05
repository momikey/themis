<template>
    <v-card class="post-editor">
        <v-text-field
            class="editor-subject"
            v-model="postSubject"
            label="Subject"
            autofocus
            clearable
        >
        </v-text-field>

        <v-textarea box class="editor-window"
            v-model="postText"
            placeholder="What do you want to say?"
            no-resize
        >
        </v-textarea>

        <v-card-actions>
        <v-btn round dark color="primary darken-4"
            @click="submitPost"
        >
            <v-icon dark left>send</v-icon>
            Post
        </v-btn>
        <v-btn round dark
            @click="cancelPost"
        >
            <v-icon dark left>cancel</v-icon>
            Cancel
        </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'

export default Vue.extend({
    data () {
        return {
            postText: '',
            postSubject: '',
            bodyPlaceholder: "Type your post here",
            subjectPlaceholder: "Give your post a title"
        }
    },
    props: [
        'replyText',
        'initialSubject'
    ],
    methods: {
        submitPost () {
            this.$emit('post-submitted', {
                subject: this.postSubject,
                body: this.postText
            })
        },
        cancelPost () {
            // TODO: Add logic to warn the user if canceling an edited post.
            this.$emit('post-canceled');
        }
    },
    mounted () {
        if (this.replyText) {
            this.postText = '> ' + this.replyText + '\n';
        }

        if (this.initialSubject) {
            this.postSubject = this.initialSubject;
        }
    }
})
</script>

<style>

</style>
