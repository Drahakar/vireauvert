<template>
    <v-tour name="tutorial" :steps="steps" :options="options"
        :callbacks="callbacks"
        v-slot="tour">
        <transition name="fade">
            <v-step
                v-if="tour.steps[tour.currentStep]"
                :step="tour.steps[tour.currentStep]"
                :key="tour.currentStep"
                :previous-step="tour.previousStep"
                :next-step="tour.nextStep"
                :stop="tour.stop"
                :skip="tour.skip"
                :is-first="tour.isFirst"
                :is-last="tour.isLast"
                :labels="tour.labels"
                :enabled-buttons="tour.enabledButtons"
                :debug="tour.debug">
                <template #header="header">
                    <header>
                        <span class="title" v-t="'tutorial_title'"></span>
                        <button @click.prevent="tour.stop"
                            class="v-step__button v-step__button-stop">
                            {{ tour.labels.buttonStop }}
                        </button>
                    </header>
                </template>
                <template #content>
                    <div class="v-step__content"
                        v-html="tour.steps[tour.currentStep].content"></div>
                </template>
                <template #actions>
                    <div class="v-step__buttons">
                        <button @click.prevent="tour.previousStep"
                            class="v-step__button v-step__button-previous"
                            :data-disabled="tour.isFirst"
                            :aria-label="$t('tutorial_prev')">
                        </button>
                        <span class="step-status">
                            {{ $t('tutorial_step_msg',
                               [tour.currentStep + 1, tour.steps.length]) }}
                        </span>
                        <button @click.prevent="tour.nextStep"
                            class="v-step__button v-step__button-next"
                            :data-disabled="tour.isLast"
                            :aria-label="$t('tutorial_next')">
                        </button>
                    </div>
                </template>
            </v-step>
        </transition>
    </v-tour>
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
                enabledButtons: {
                    buttonSkip: false,
                },
                labels: {
                    buttonPrevious: this.$t('tutorial_prev'),
                    buttonNext: this.$t('tutorial_next'),
                    buttonStop: this.$t('tutorial_stop'),
                },
            },
            steps: [
                {
                    target: '[data-tutorial-step="temperature"]',
                    content: this.$t('tutorial_temperature_html'),
                    params: {
                        placement: "left",
                    },
                },
                {
                    target: '[data-tutorial-step="year-selector"]',
                    content: this.$t('tutorial_year_html'),
                    params: {
                        // Important, otherwise this pushes the height past 100%
                        placement: "top",
                    },
                },
                {
                    target: '[data-tutorial-step="catastrophes-count"]',
                    content: this.$t('tutorial_catastrophes_html'),
                },
            ],
            callbacks: { 
                onSkip: () => {
                    localStorage.setItem('tutorial_completed', 'true');
                },
                onFinish: () => {
                    localStorage.setItem('tutorial_completed', 'true');
                }
            }
        };
    },
    watch: {
        ready: function (isReady, wasReady) {
            if (!wasReady && isReady) {
                if (!localStorage.getItem('tutorial_completed')) {
                    this.$tours['tutorial'].start();
                }
            }
        },
    }
});
</script>

<style scoped>
.v-tour :deep(.v-step) {
    --header-background-color: var(--color-background);
    padding: 0;
    background-color: var(--color-background-accent);
    color: var(--clr-gris-moyen);
    border-radius: var(--border-radius);
    max-width: var(--tutorial-width);
    font-size: var(--sz-300);
    box-shadow: 0px 4px 4px rgba(53, 53, 53, 0.25);
}

header {
    background-color: var(--header-background-color);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    color: var(--color-text);
    font-size: var(--sz-400);
    padding: var(--sz-30);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

header .title {
    margin-left: var(--sz-100);
}

.v-step[data-popper-placement="bottom"] :deep(.v-step__arrow) {
    /* arrow is next to header then -- must match background-color. */
    background-color: var(--header-background-color);
}

.v-step__content {
    padding: var(--sz-100) var(--sz-600);
    display: flex;
    flex-direction: column;
    gap: var(--sz-300);
}

.v-step__content :deep(b) {
    font-weight: var(--fw-regular);
    color: var(--color-accent);
}

.v-step__buttons {
    padding: var(--sz-30);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.v-step__button-stop {
    font-size: var(--sz-300);
    color: var(--clr-blanc);
    background-color: var(--clr-gris-pale);
    border-radius: var(--border-radius);
    padding: var(--sz-50) var(--sz-100);
}

.v-step__buttons .v-step__button {
    background-size: 100%;
    width: var(--sz-700);
    height: var(--sz-700);
}

.v-step__button-previous {
    background-image: url("/icons/right-arrow.png");
    transform: scaleX(-1);
}

.v-step__button-next {
    background-image: url("/icons/right-arrow.png");
}

.step-status {
    color: var(--clr-gris-pale);
    font-size: var(--sz-300);
}

.v-step__button[data-disabled="true"] {
    opacity: 0.2;
}

.v-step__button:not([data-disabled="true"]):hover {
    opacity: 0.8;
}

</style>
