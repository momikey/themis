<template>
    <div class="post-editor">
        <header>
            <p class="post-info"></p>
        </header>

        <section>
            <input
                class="editor-subject"
                v-model="postSubject"
                :placeholder="subjectPlaceholder"
            />
            <textarea class="editor-window"
                v-model="postText"
                rows="10" cols="72"
                :placeholder="bodyPlaceholder"
            >
            </textarea>
        </section>

        <footer>
            <button @click="cancelPost">Cancel</button>
            <button @click="submitPost">Post</button>
        </footer>
    </div>
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
        'replyText'
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
    }
})
</script>

<style>
    .post-editor {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
    }

    .post-editor header, .post-editor section, .post-editor footer {
        flex-shrink: 0;
    }

    .post-editor header {

    }

    .post-editor section {
        flex-grow: 1;
        min-height: 50%;
        overflow-y: auto;
        align-items: stretch;
        display: flex;
        flex-direction: column;
    }

    .post-editor footer {
        display: flex;
        align-items: stretch;
    }

    .post-editor footer button:first-child {
        margin-left: auto;
    }

</style>
