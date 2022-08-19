<template>
    <div>
        <div id="gradient">
            <div id="step-offset">
                <div class="step" v-for="(colour, index) of gradientSteps"
                    :style="{ backgroundColor: colourToHex(colour) }">
                    <span class="marking" v-if="index % 10 === 0">{{ (index * 0.1) - 1 }} °C</span>
                </div>
                <div class="selected-wrapper"
                    :style="{ top: index ? `${(gradientSteps.length - (index + 1)) * 12}px` : '0px', visibility: index !== undefined ? 'visible' : 'hidden' }">
                    <span class="selected"></span>
                </div>
                <div class="label">°C</div>
            </div>
        </div>
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
        },
        district: {
            type: Number,
            default: 0
        }
    },
    setup(props) {
        return {};
    },
    data() {
        return { gradientSteps: temperatureGradient, colourToHex };
    },
    computed: {
        index() {
            return this.statistics.temp_delta != undefined ? getGradientColourIndex(this.statistics.temp_delta) : undefined;
        }
    }
})
</script>

<style scoped>
#gradient {
    width: 46px;
    min-height: 0;
}

#step-offset {
    margin-left: 4px;
    padding: 5px;
    display: flex;
    flex-direction: column-reverse;
    background-color: rgba(255, 255, 255, 0.7);
}

.step {
    position: relative;
    height: 6px;
}

@media (min-width: 768px) {

    /* for devices >= 'md' */
    .step {
        height: 12px;
    }
}

.step .marking {
    text-align: center;
    font-size: small;
    position: absolute;
    top: -4px;
    width: 100%;
    height: 14px;
    text-shadow: 0 0 3px #FFFFFF;
}

.step+.step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.label {
    font-weight: bold;
    margin-bottom: 4px;
    text-align: center;
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
}
</style>
