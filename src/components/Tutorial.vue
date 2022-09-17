<template>
    <v-tour name="tutorial" :steps="steps" :options="options"></v-tour>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        ready: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            options: {
                // TODO: localize
                labels: {
                    buttonSkip: 'Skip tour',
                    buttonPrevious: 'Previous',
                    buttonNext: 'Next',
                    buttonStop: 'Finish',
                }
            },
            // TODO: localize
            steps: [
                {
                    target: '[data-tutorial-step="temperature"]',
                    content: 'Hello!',
                },
                {
                    target: '[data-tutorial-step="year-selector"]',
                    content: 'World!'
                },
                {
                    target: '[data-tutorial-step="catastrophes-count"]',
                    content: 'Hi!'
                },
            ],
        };
    },
    watch: {
        ready: function(isReady, wasReady) {
            if (!wasReady && isReady) {
                this.$tours['tutorial'].start();
            }
        },
    }
});
</script>

<style scoped>
.v-tour >>> .v-step {
    background-color: var(--clr-gris-mi-fonce);
    color: var(--clr-blanc);
    border-radius: var(--border-radius);
}

.v-tour >>> .v-step__button {
    color: var(--clr-blanc);
    border: 1px solid var(--clr-blanc);
    border-radius: var(--border-radius);
    font-size: var(--sz-400);
}
</style>
