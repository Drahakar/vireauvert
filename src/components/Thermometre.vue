<template>
    <div>
        <div id="gradient">
            <div class="label">°C</div>
            <div id="step-offset">
                <div class="step" v-for="colour of gradientSteps" :style="{ backgroundColor: colourToHex(colour) }">
                </div>
                <div v-for="marking of markings" class="marking text-nowrap text-end"
                    :style="{ bottom: `calc(0.2em + ${marking.position * 8}px)` }">
                    {{ $n(marking.temp, 'compact_delta') }}
                </div>
                <div class="selected"
                    :style="{ bottom: index ? `${index * 8}px` : '0px', visibility: index !== undefined ? 'visible' : 'hidden' }">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { getGradientColourIndex, temperatureGradient, colourToHex, gradientScale, minTemp } from '@/utils/colours';
import { RegionStatistics } from '@/models/yearly_data';
import { defineComponent, PropType } from 'vue';

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
        const markings = Array.from(Array(Math.ceil(temperatureGradient.length * gradientScale)).keys()).map(x => {
            return {
                position: Math.floor(x / gradientScale),
                temp: x + minTemp
            }
        });
        return { gradientSteps: temperatureGradient, markings, colourToHex };
    },
    computed: {
        index() {
            return this.statistics.temp_delta != undefined ? getGradientColourIndex(this.statistics.temp_delta) : undefined;
        },
    }
})
</script>

<style scoped>
#gradient {
    min-height: 0;
}

#step-offset {
    position: relative;
    margin-left: 4px;
    padding: 5px;
    display: flex;
    flex-direction: column-reverse;
    background-color: rgba(255, 255, 255, 0.7);
}

.step {
    position: relative;
    height: 8px;
    width: 3ch;
    margin-right: calc(1ch + 4px);
}

.marking {
    text-align: center;
    font-size: small;
    position: absolute;
    width: 100%;
    height: 14px;
    right: 2px;
    line-height: 1em;
    font-weight: bold;
}

.step+.step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.label {
    font-weight: bold;
    padding-bottom: 4px;
    text-align: center;
    height: 24px;
    margin-left: 4px;
    background-color: rgba(255, 255, 255, 0.7);
}

.selected {
    position: absolute;
    z-index: 1;
    left: -4px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;

    border-left: 6px solid black;
    margin-bottom: 3px;
}
</style>
