<template>
    <div class="wrapper" :style="cssVars">
        <template v-for="notchNum in numNotches">
            <span v-if="(notchNum - 1) % notchSteps == 0" class="notch"
                :style="{'--notch-idx': notchNum - 1}">
                {{$n(startNotch + notchNum - 1, 'integer')}}
            </span>
        </template>

        <div class="thermometer">
            <div class="stem">
                <div class="mercury"></div>
            </div>
            <div class="bulb">
                <p class="bulb-text">°C</p>
            </div>

            <div class="reference-value pill">
                <span>{{$n(referenceValue, 'temperature_no_unit')}}</span>
                <span>{{referenceYear}}</span>
            </div>
        </div>

        <div class="current-value pill">
            <span>{{$n(currentValue, 'temperature_no_unit')}}</span>
            <span>{{year}}</span>
        </div>

        <!-- TODO: emojis -->
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue';
import { REFERENCE_YEAR } from "@/models/constants";
import { RegionStatistics } from '@/models/yearly_data';

const START_NOTCH = -6;
const END_NOTCH = 10;
const NOTCH_STEPS = 2;  // Only display a notch every NOTCH_STEPS notches
const NUM_NOTCHES = END_NOTCH - START_NOTCH + 1;


export default defineComponent({
    props: {
        statistics: {
            type: Object as PropType<RegionStatistics>,
            required: true,
        },
        referenceStatistics: {
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
            startNotch: START_NOTCH,
            notchSteps: NOTCH_STEPS,
            referenceYear: REFERENCE_YEAR,
        };
    },
    computed: {
        currentValue(): number {
            return this.statistics.avg_temp ?? 0;
        },
        referenceValue(): number {
            return this.referenceStatistics.avg_temp ?? 0;
        },
        cssVars(): Object {
            // CSS variables that are expected to be set based on current state.
            return {
                '--num-notches': this.numNotches,
                '--notch-value': this.valueToNotchIndex(this.currentValue),
                '--reference-value': this.valueToNotchIndex(this.referenceValue),
            };
        }
    },
    methods: {
        valueToNotchIndex(value: number): number {
            // Return a float that maps to what notch index the current value
            // would map to, allowing to be in-between notches.
            return value - START_NOTCH;
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
    /* limit values where we start clamping */
    --notch-min: var(--sz-bulb) / 2;
    --notch-max: 100%;
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
    height: clamp(var(--notch-min),
                  var(--notch-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset),
                  var(--notch-max));
    background-color: var(--clr-thermometer-mercury);
    transition: height var(--mercury-transition);
}

@media (prefers-reduced-motion: reduce) {
    .mercury {
        transition: none;
    }
    .pill {
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

.pill {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 50%);
    width: max-content;
    padding: 1px var(--sz-30) 1px var(--sz-30);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    line-height: 1.5;
    gap: var(--sz-50);
    transition: bottom var(--mercury-transition);
    color: var(--clr-blanc);
    border-radius: var(--sz-600);
}

.current-value {
    min-width: 70px;
    bottom: clamp(var(--notch-min),
                  var(--notch-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset),
                  var(--notch-max));
    border: 2px solid var(--clr-blanc);
    background-color: var(--color-accent);
    font-size: var(--sz-400);
    z-index: 1;  /* show above notches */
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
}

.reference-value {
    min-width: 60px;
    background-color: var(--clr-thermometer-mercury);
    font-size: var(--sz-200);
    bottom: clamp(var(--notch-min),
                  var(--reference-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset),
                  var(--notch-max));
}
</style>
