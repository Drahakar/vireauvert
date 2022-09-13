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

        <div class="current-value" :style="{'--notch-value': notchValue}">
            <span>{{$n(currentValue, 'temperature_no_unit')}}</span>
            <span>{{year}}</span>
        </div>

        <template v-for="notchNum in numNotches">
            <span v-if="(notchNum - 1) % notchSteps == 0" class="notch"
                :style="{'--notch-idx': notchNum - 1}">
                {{$n(minNotch + notchNum - 1, 'integer')}}
            </span>
        </template>

        <!-- TODO: emojis -->
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
        year: {
            type: Number,
            required: true,

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
            return this.currentValue - MIN_NOTCH;
        },
        currentValue(): number {
            return this.statistics.avg_temp ?? 0;
        },
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
    --mercury-transition: 0.15s ease;
    height: 100%;
    position: relative;
    margin-bottom: calc(var(--sz-bulb) / 2);  /* space for the bulb */
}

.thermometer {
    height: 100%;
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
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
    transition: height var(--mercury-transition);
}

@media (prefers-reduced-motion: reduce) {
    .mercury {
        transition: none;
    }
    .current-value {
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
    left: calc(50% - var(--sz-notch-width) - var(--sz-stem-width) / 2 - var(--sz-stem-border));
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

.current-value {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 50%);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: var(--sz-50);
    min-width: 70px;
    padding: 1px var(--sz-30) 2px var(--sz-30);
    bottom: calc(var(--notch-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    transition: bottom var(--mercury-transition);
    width: max-content;
    color: var(--clr-blanc);
    background-color: var(--color-accent);
    border: 2px solid var(--clr-blanc);
    border-radius: var(--sz-600);
    z-index: 5;  /* show above notches */
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
}
</style>
