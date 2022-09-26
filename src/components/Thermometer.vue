<template>
    <div class="wrapper" :style="cssVars">
        <div class="notches-container">
            <template v-for="notchNum in numNotches">
                <span v-if="(notchNum - 1) % notchSteps == 0" class="notch"
                    :style="{'--notch-idx': notchNum - 1}">
                    {{$n(startNotch + notchNum - 1, 'compact_delta')}}
                </span>
            </template>
        </div>

        <div class="thermometer">
            <div class="stem">
                <div class="mercury tracked-current track-clip-top" :style="mercuryStyle"></div>
            </div>
            <div class="bulb">
                <p class="bulb-text">°C</p>
            </div>

            <div class="reference-value pill tracked-reference track-bottom" data-tutorial-step="thermo-reference-value">
                <span>{{referenceYear}}</span>
                <span>{{$n(referenceValueDisplayed, 'temperature')}}</span>
            </div>
        </div>

        <div class="risky-value pill tracked-risky track-bottom" data-tutorial-step="thermo-risky-value">
            <span>{{$n(riskyValue, 'temperature_delta_no_unit')}}</span>
            <div class="line"></div>
        </div>

        <div class="current-value pill tracked-current track-bottom">
            <img :src="emojiPath" data-tutorial-step="temperature">
            <span>{{$n(currentValueDisplayed, 'temperature_delta')}}</span>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, CSSProperties, PropType } from 'vue';
import { TEMPERATURE_THEME } from "@/utils/colours";
import { REFERENCE_YEAR } from "@/models/constants";
import { RegionStatistics } from '@/models/yearly_data';

export const START_NOTCH = -1;
export const END_NOTCH = 7;
const NOTCH_STEPS = 1;  // Only display a notch every NOTCH_STEPS notches
const NUM_NOTCHES = END_NOTCH - START_NOTCH + 1;

/* Visually, the lowest notch is this much % into the stem height */
const NOTCH_OFFSET = 0.1;
/* Visually, the highest notch is this much % higher than NOTCH_OFFSET */
const NOTCH_HEIGHT = 0.85;

const RISKY_DELTA = 1.5;  // Show different visuals for ref temperature + this.


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
        riskyValue(): number {
            return this.referenceValue + RISKY_DELTA;
        },
        currentValue(): number {
            return this.statistics.temp_delta ?? 0;
        },
        currentValueDisplayed(): number {
            return this.statistics.temp_delta ?? 0;
        },
        referenceValue(): number {
            return this.referenceStatistics.temp_delta ?? 0;
        },
        referenceValueDisplayed(): number {
            return this.referenceStatistics.avg_temp ?? 0;
        },
        cssVars(): CSSProperties {
            // CSS variables that are expected to be set based on current state.
            return {
                '--num-notches': this.numNotches,
                '--current-value': this.valueToNotchIndex(this.currentValue),
                '--reference-value': this.valueToNotchIndex(this.referenceValue),
                '--risky-value': this.valueToNotchIndex(this.riskyValue),
                '--notch-offset': `${NOTCH_OFFSET * 100}%`,
                '--notch-height': `${NOTCH_HEIGHT * 100}%`,
            };
        },
        emojiPath(): string {
            if (this.currentValue <= this.referenceValue) {
                return '/icons/Emoji1.png';
            } else if (this.currentValue <= this.riskyValue) {
                return '/icons/Emoji2.png';
            } else {
                return '/icons/Emoji3.png';
            }
        },
        mercuryStyle() {
            const size = END_NOTCH - START_NOTCH;
            const downGap = NOTCH_OFFSET * size;
            const upGap = (1 - NOTCH_OFFSET - NOTCH_HEIGHT) * size;
            const min = START_NOTCH - downGap;
            const max = END_NOTCH + upGap;
            const gradient = TEMPERATURE_THEME.toGradientStops(min, max).map(stop => {
                const colour = stop.colour.toHex();
                const percent = stop.ratio * 100;
                return `${colour} ${percent}%`;
            }).join(', ');
            return {
                'background': `linear-gradient(0deg, ${gradient})`,
            };
        },
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
.tracked-current {
    /* Use this class to track the current value on the thermometer */
    --tracked-value: var(--current-value);
}

.tracked-reference {
    /* Use this class to track the reference value on the thermometer */
    --tracked-value: var(--reference-value);
}

.tracked-risky {
    /* Use this class to track the 'risky' value on the thermometer */
    --tracked-value: var(--risky-value);
}

.track-height, .track-bottom, .track-clip-top {
    /* value to assign to e.g. height or bottom to match the --tracked-value */
    --tracked-point: clamp(
        var(--notch-min),
        var(--tracked-value) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset),
        var(--notch-max));
}

.track-height {
    height: var(--tracked-point);
    transition: height var(--mercury-transition);
}

.track-bottom {
    bottom: var(--tracked-point);
    transition: bottom var(--mercury-transition);
}

.track-clip-top {
    clip-path: inset(calc(100% - var(--tracked-point)) 0 0 0);
    transition: clip-path var(--mercury-transition);
}

@media (prefers-reduced-motion: reduce) {
    .track-height, .track-bottom, .track-clip-top {
        transition: none;
    }
}

.wrapper {
    --sz-stem-width: var(--sz-300);
    --sz-stem-border: 2px;
    --sz-bulb: var(--sz-900);
    /* limit values where we start clamping */
    --notch-min: var(--sz-bulb) / 2;
    --notch-max: 100%;
    --mercury-transition: 0.15s ease;
    height: 100%;
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
    border-radius: var(--border-radius);
    overflow: hidden;
}

.mercury {
    height: 100%;
    width: var(--sz-stem-width);
    position: absolute;
    bottom: 0;
}

.notch {
    --sz-notch-width: var(--sz-600);
    --sz-notch-gap: var(--sz-30);
    min-width: var(--sz-notch-width);
    position: absolute;
    transform: translateY(50%);
    bottom: calc(var(--notch-idx) / (var(--num-notches) - 1) * var(--notch-height) + var(--notch-offset));
    left: calc(50% - var(--sz-notch-width) - var(--sz-stem-width) / 2 - var(--sz-stem-border));
    padding-right: var(--sz-notch-gap);
    font-size: var(--sz-200);
    color: var(--clr-blanc);
    text-align: right;
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
}

.notches-container {
    position: absolute;
    min-height: 100%;
}

.bulb {
    position: absolute;
    background-color: var(--clr-thermometer-low);
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
    background-color: var(--clr-thermometer-low);
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
    padding: 2px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--sz-50);
    color: var(--clr-blanc);
    border-radius: var(--border-radius);
    line-height: 100%;
}

.pill span {
    display: block;
    height: 100%;
    white-space: nowrap;
}

.current-value {
    width: var(--thermo-current-value-width);
    border: 2px solid var(--clr-blanc);
    background-color: var(--color-accent);
    font-size: var(--sz-400);
    z-index: 1;  /* show above notches */
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
}

.current-value span {
    flex: 1;
    text-align: right;
}

.reference-value {
    width: 11ch;
    color: var(--color-text);
    background-color: var(--clr-thermometer-zero);
    font-size: var(--sz-200);
    padding: 2px 6px;
}

.risky-value {
    font-size: var(--sz-300);
    width: 11ch;
}

.risky-value > span {
    color: var(--clr-blanc);
    text-shadow:
       -1px -1px 0 var(--clr-alerte),
        1px -1px 0 var(--clr-alerte),
       -1px  1px 0 var(--clr-alerte),
        1px  1px 0 var(--clr-alerte),
        0px  0px 2px rgba(0, 0, 0, 0.5);
}

.risky-value .line {
    width: 100%;
    height: 2px;
    background-color: var(--clr-alerte);
}

img {
    left: 0;
    transform: translateX(-50%);
    width: var(--sz-900);
    height: var(--sz-900);
    position: absolute;
}
</style>
