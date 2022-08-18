<template>
    <div id="gradient">
        <div class="step" v-for="(colour, index) of gradientSteps" :style="{ backgroundColor: colourToHex(colour) }">
            <span class="selected" v-if="isSelectedGradientStep(statistics, index)"></span>
            <span class="tooltip">
                + {{ (index * 0.1).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                }} ° C
            </span>
        </div>
        <div class="label">° C</div>
    </div>
</template>

<script lang="ts">
import { getGradientColourIndex, temperatureGradient, colourToHex } from '@/utils/colours';
import { RegionStatistics } from '@/models/yearly_data';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        statistics: {
            type: Object as PropType<RegionStatistics>,
            default: {}
        }
    },
    data() {
        return { gradientSteps: temperatureGradient, colourToHex };
    },
    methods: {
        isSelectedGradientStep(info: RegionStatistics, index: number): boolean {
            return info.temp_delta != undefined && getGradientColourIndex(info.temp_delta) === index;
        }

    }
})
</script>

<style scoped>
#gradient {
    position: absolute;
    right: 16px;
    top: 16px;
    z-index: 400;
    width: 42px;
    display: flex;
    flex-direction: column-reverse;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.5);
}

#gradient div.step {
    height: 8px;
}

@media (min-width: 768px) {

    /* for devices >= 'md' */
    #gradient div.step {
        height: 16px;
    }
}

#gradient div.step {
    position: relative;
    opacity: 0.8;
}

#gradient>div.step+div.step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

#gradient div.label {
    font-weight: bold;
    margin-bottom: 4px;
    text-align: center;
}

#gradient div.step .tooltip {
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: 64px;
    top: -5px;
    right: 105%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 5px;
}

#gradient div.step:hover .tooltip {
    visibility: visible;
}

#gradient div.step .selected {
    position: absolute;
    z-index: 1;
    right: 110%;
    top: 2px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;

    border-left: 6px solid black;
}
</style>