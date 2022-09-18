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
                <!-- TODO style the ones below -->
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
                    <div class="v-step__content">
                        <!-- TODO: styling of some words -->
                        <div v-html="tour.steps[tour.currentStep].content"></div>
                    </div>
                </template>
                <template #actions>
                    <div class="v-step__buttons">
                        <!-- TODO: style when isFirst/isLast -->
                        <button @click.prevent="tour.previousStep"
                            class="v-step__button v-step__button-previous">
                            <!-- TODO: use icon -->
                            {{ tour.labels.buttonPrevious }}
                        </button>
                        <span class="step-status">
                            {{ $t('tutorial_step_msg',
                               [tour.currentStep + 1, tour.steps.length]) }}
                        </span>
                        <button @click.prevent="tour.nextStep"
                            class="v-step__button v-step__button-next">
                            <!-- TODO: use icon -->
                            {{ tour.labels.buttonNext }}
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
                    content: this.$t('tutorial_temperature'),
                    params: {
                        placement: "left",
                    },
                },
                {
                    target: '[data-tutorial-step="year-selector"]',
                    content: this.$t('tutorial_year'),
                    params: {
                        // Important, otherwise this pushes the height past 100%
                        placement: "top",
                    },
                },
                {
                    target: '[data-tutorial-step="catastrophes-count"]',
                    content: this.$t('tutorial_catastrophes'),
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
    max-width: calc(var(--sz-700) * 9);
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

.v-step__buttons {
    padding: var(--sz-30);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.v-step__content {
    padding: var(--sz-100);
}

.v-step__button {
    font-size: var(--sz-300);
    color: var(--clr-blanc);
    background-color: var(--clr-gris-pale);
    border: 1px solid var(--clr-blanc);
    border-radius: var(--border-radius);
    font-size: var(--sz-400);

    /* TODO: app styling instead of these v3-step defaults */
    height: 1.8rem;
    line-height: 1rem;
    padding: 0.35rem 0.4rem;
    margin: 0 0.2rem;
}

.step-status {
    color: var(--clr-gris-pale);
    font-size: var(--sz-300);
}
</style>
