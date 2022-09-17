<template>
    <!-- TODO: customize style -->
    <v-tour name="tutorial" :steps="steps" :options="options"></v-tour>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
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
    mounted() {
        // TODO: only show if we have an unset cookie to spare returning people?
        this.$tours['tutorial'].start();
    },
});
</script>

<style scoped>
</style>
