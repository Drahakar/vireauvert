<template>
    <div class="wrapper" :style="{'--num-notches': numNotches}">
        <div class="thermometer">
            <div class="stem">
                <div class="mercury" :style="{'--notch-value': notchValue}"></div>
            </div>
            <div class="bulb">
                <p class="bulb-text">°C</p>
            </div>
        </div>

        <template v-for="notchNum in numNotches">
            <span v-if="(notchNum - 1) % notchSteps == 0" class="notch"
                :style="{'--notch-idx': notchNum - 1}">
                {{$n(minNotch + notchNum - 1, 'integer')}}
            </span>
        </template>

        <!-- TODO: emojis -->
        <!-- TODO: show current value -->
        <!-- TODO: show 1990 -->
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue';
import { RegionStatistics } from '@/models/yearly_data';

const MIN_NOTCH = -6;
const MAX_NOTCH = 10;
const NOTCH_STEPS = 2;  // Only display a notch every NOTCH_STEPS notches
const NUM_NOTCHES = MAX_NOTCH - MIN_NOTCH + 1;

export default defineComponent({
    props: {
        statistics: {
            type: Object as PropType<RegionStatistics>,
            required: true,
        },
        district: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            numNotches: NUM_NOTCHES,
            minNotch: MIN_NOTCH,
            notchSteps: NOTCH_STEPS,
        };
    },
    computed: {
        notchValue(): number {
            // Return a float that maps to what notch index the current value
            // would map to, allowing to be in-between notches.
            const avg_temp = this.statistics.avg_temp ?? 0;
            return avg_temp - MIN_NOTCH;
        }
    },
})
</script>

<style scoped>
.wrapper {
    --sz-stem-width: var(--sz-300);
    --sz-stem-border: 2px;
    /* the lowest notch is this much % into the stem height */
    --notch-offset: 10%;
    /* the highest notch is this much % higher than notch-offset */
    --notch-height: 85%;
    --sz-bulb: 32px;
    height: 100%;
    position: relative;
    margin-bottom: calc(var(--sz-bulb) / 2);  /* space for the bulb */
}

.thermometer {
    height: 100%;
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
}

.stem {
    width: calc(var(--sz-stem-width) + var(--sz-stem-border) * 2);
    position: relative;
    height: 100%;
    border: var(--sz-stem-border) solid var(--clr-thermometer-border);
    background-color: var(--clr-thermometer-background);
    border-radius: var(--sz-600);
    overflow: hidden;
}

.mercury {
    width: var(--sz-stem-width);
    position: absolute;
    bottom: 0;
    height: calc(var(--notch-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    background-color: var(--clr-thermometer-mercury);
    transition: height 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
    .mercury {
        transition: none;
    }
}

.notch {
    --sz-notch-width: var(--sz-400);
    --sz-notch-gap: var(--sz-30);
    width: var(--sz-notch-width);
    position: absolute;
    transform: translateY(50%);
    bottom: calc(var(--notch-idx) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    left: calc(0px - var(--sz-notch-width));
    padding-right: var(--sz-notch-gap);
    font-size: var(--sz-200);
    color: var(--clr-blanc);
    text-align: right;
}

.bulb {
    position: absolute;
    background-color: var(--clr-thermometer-mercury);
    width: var(--sz-bulb);
    height: var(--sz-bulb);
    left: calc(50% - var(--sz-bulb) / 2);
    bottom: calc(0px - var(--sz-bulb) / 2);
    border-radius: 50%;
    border: var(--sz-stem-border) solid var(--clr-thermometer-border);
}

.bulb::before {
    content: '';
    display: block;
    width: var(--sz-stem-width);
    height: 6px;
    background-color: var(--clr-thermometer-mercury);
    top: -3px;
    left: calc(50% - var(--sz-stem-width) / 2);
}

.bulb-text {
    text-align: center;
    font-size: var(--sz-600);
    color: var(--clr-blanc);
}
</style>
