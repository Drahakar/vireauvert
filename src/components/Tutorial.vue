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
                labels: {
                    buttonSkip: this.$t('tutorial_skip'),
                    buttonPrevious: this.$t('tutorial_prev'),
                    buttonNext: this.$t('tutorial_next'),
                    buttonStop: this.$t('tutorial_finish'),
                },
            },
            steps: [
                {
                    target: '[data-tutorial-step="temperature"]',
                    content: this.$t('tutorial_temperature'),
                },
                {
                    target: '[data-tutorial-step="year-selector"]',
                    content: this.$t('tutorial_year'),
                },
                {
                    target: '[data-tutorial-step="catastrophes-count"]',
                    content: this.$t('tutorial_catastrophes'),
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
    max-width: calc(var(--sz-900) * 10);
}

.v-tour >>> .v-step__button {
    color: var(--clr-blanc);
    border: 1px solid var(--clr-blanc);
    border-radius: var(--border-radius);
    font-size: var(--sz-400);
}
</style>
