<template>
    <div id="gradient">
        <div class="step" v-for="(colour, index) of gradientSteps" :style="{ backgroundColor: colourToHex(colour) }">
            <span class="marking" v-if="index % 10 === 0">{{ (index * 0.1) - 1 }} °C</span>
            <span class="selected" v-if="isSelectedGradientStep(statistics, index)"></span>
        </div>
        <div class="label">°C</div>
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

#gradient .step {
    position: relative;
    height: 8px;
}

@media (min-width: 768px) {

    /* for devices >= 'md' */
    #gradient .step {
        height: 12px;
    }
}

#gradient .step .marking {
    text-align: center;
    font-size: small;
    position: absolute;
    top: -4px;
    width: 100%;
    height: 14px;
    text-shadow: 0 0 3px #FFFFFF;
}

#gradient>.step+.step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

#gradient .label {
    font-weight: bold;
    margin-bottom: 4px;
    text-align: center;
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