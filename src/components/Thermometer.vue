<template>
    <div class="thermometer" :style="{'--num-notches': numNotches}">
        <div class="stem">
            <div class="mercury" :style="{'--notch-value': notchValue}"></div>
        </div>
        <!-- TODO: proper formatting of delta temp -->
        <span v-for="notchNum in numNotches" class="notch"
            :style="{'--notch-idx': notchNum - 1}">
            {{minNotch + notchNum - 1}}
        </span>

        <div class="bulb">
            <p class="bulb-text">˚C</p>
        </div>

        <!-- TODO: emojis -->
        <!-- TODO: show current value -->
        <!-- TODO: show 1990 -->
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue';
import { RegionStatistics } from '@/models/yearly_data';

const MIN_NOTCH = -1;
const MAX_NOTCH = 7;
const NUM_NOTCHES = MAX_NOTCH - MIN_NOTCH + 1;

export default defineComponent({
    props: {
        statistics: {
            type: Object as PropType<RegionStatistics>,
            default: {}
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
        };
    },
    computed: {
        notchValue(): number {
            // Return a float that maps to what notch index the current value
            // would map to, allowing to be in-between notches.
            const delta = this.statistics.temp_delta ?? 0;
            return delta - MIN_NOTCH;
        }
    },
})
</script>

<style scoped>
.thermometer {
    --sz-stem-width: var(--sz-300);
    --sz-stem-border: 2px;
    /* the lowest notch is this much % into the stem height */
    --notch-offset: 10%;
    /* the highest notch is this much % higher than notch-offset */
    --notch-height: 89%;
    height: 100%;
    position: relative;
    margin-bottom: 16px;  /* space for the bulb */
}

.stem {
    width: calc(var(--sz-stem-width) + var(--sz-stem-border) * 2);
    position: relative;
    height: 100%;
    border: var(--sz-stem-border) solid var(--clr-thermometer-border);
    border-radius: var(--sz-600);
    overflow: hidden;
}

.mercury {
    width: var(--sz-stem-width);
    position: absolute;
    bottom: 0;
    height: calc(var(--notch-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    background-color: var(--clr-thermometer-mercury);
}

.notch {
    --sz-notch-width: var(--sz-400);
    --sz-notch-gap: var(--sz-30);
    width: var(--sz-notch-width);
    position: absolute;
    bottom: calc(var(--notch-idx) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    left: calc(0px - var(--sz-notch-width));
    padding-right: var(--sz-notch-gap);
    font-size: var(--sz-200);
    color: var(--clr-gris-pale);
    text-align: right;
}

.notch::after {
    content: '';
    background-color: var(--color-background);
    margin-left: calc(100% + var(--sz-notch-gap));
    margin-top: -100%;
    width: 2px;
    height: 2px;
    display: block;
}

.bulb {
    position: absolute;
    background-color: var(--clr-thermometer-mercury);
    width: 32px;
    height: 32px;
    left: calc(50% - 16px);
    bottom: -16px;
    border-radius: 50%;
    border: var(--sz-stem-border) solid var(--clr-thermometer-border);
}

.bulb::before {
    content: '';
    display: block;
    width: var(--sz-stem-width);
    height: 5px;
    background-color: var(--clr-thermometer-mercury);
    top: calc(0px - var(--sz-stem-border));
    left: calc(50% - var(--sz-stem-width) / 2);
}

.bulb-text {
    text-align: center;
    font-size: var(--sz-600);
    color: var(--clr-blanc);
}
</style>
