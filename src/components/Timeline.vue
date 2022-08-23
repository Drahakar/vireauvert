<template>
    <div class="timeline row">
        <div id="slidertitle" class="col-md-2">{{ $t('research_year') }}</div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years" :marks="marks" :adsorb="false">
                <template v-slot:label="{value}">
                    <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                    <div :class="['vue-slider-mark-label', 'custom-label', 'event-count', 'badge', 'text-bg-danger']">{{catastrophesCountByYears(value)}}</div>
                </template>
                <template v-slot:process="{ style, end }">
                    <div class="vue-slider-process" :style="[style, temperatureGradientStyle(end)]"></div>
                    <div class="vue-slider-process prevision-indicator" :style="[style, modeledYearsStyle]"></div>
                </template>
                <template v-slot:mark="{ pos, label }">
                    <div class="vue-slider-mark" :style="{ left: `${pos}%` }">
                        <div class="vue-slider-mark-label">{{ label }}</div>
                    </div>
                    <div class="catastrophe-dot" :style="{ left: `calc(${pos}% - 14.5px)` }"></div>
                </template>
            </vue-slider>
            
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { computed, PropType, defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'
import { TIMELINE_YEARS,BEGIN_MODELED_YEAR } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { useStatisticStore } from '@/stores/statistics';
import { CatastropheFilter } from '@/models/catastrophes';
import { temperatureGradient, getGradientColourIndex,colourToHex } from '@/utils/colours';

 function generateTemperatureGradient(statisticStore: ReturnType<typeof useStatisticStore>, district: number, progressPercent: number): String[] {
        const shownYears = TIMELINE_YEARS.slice(0, progressPercent/100 * TIMELINE_YEARS.length);
        const yearRatio = (1 / shownYears.length * 100);
        const temperatureDeltas: (number|undefined)[] = TIMELINE_YEARS.map(year => statisticStore.findStatistics(year, district).temp_delta);
      
        return temperatureDeltas.map((tempDelta: number|undefined, index: number) => {
            const colour = temperatureGradient[getGradientColourIndex(tempDelta ?? 0)];
            return `${colourToHex(colour)} ${yearRatio * index}%`;
        });
    }

export default defineComponent({
    components: { VueSlider },
    emits: ['yearSelected'],
    props: {
        isMobile: {
            type: Boolean,
            default: false,
        },
        year: {
            type: Number,
            default: 0
        },
        catastropheFilter: {
            type: String as PropType<CatastropheFilter>,
            default: ''
        },
        district: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const selectedYear = computed({
            get: () => props.year,
            set: value => emit('yearSelected', value)
        });
        const catastropheStore = useCatastropheStore();
        const statisticStore = useStatisticStore();
        return { 
            selectedYear,
            catastropheStore, 
            statisticStore
        };
    },
    data() {
        const ratio = TIMELINE_YEARS.filter(x => x <= BEGIN_MODELED_YEAR).length/TIMELINE_YEARS.length;
        return {
            marks: TIMELINE_YEARS,
            years: TIMELINE_YEARS,
            modeledYearsStyle: [
                'left:' + (ratio * 100) +'%', 
                'width:' + ((1 - ratio) * 100) + '%'
            ]   
        }
    },
    methods: {
        catastrophesCountByYears(year: number): Number {
            return this.catastropheStore.findCatastrophes(year, this.district, this.catastropheFilter).size;
        },
        temperatureGradientStyle(progressPercent: number) {
            const gradient = generateTemperatureGradient(this.statisticStore, this.district, progressPercent).join(",")
            return {
                '--background-process': `linear-gradient(to right, ${gradient})`
            }
        }
    }
});
</script>

<style scoped>
.timeline {
    padding: 30px;
}

#slidertitle {
    font-weight: bold;
    font-size: 1.2em;
}

#slidercontainer input {
    -webkit-appearance: none;
    background: #ffffff;
    outline: none;
    opacity: 1
}

.vue-slider-mark-label.custom-label.event-count {
    top:-32px;
}

.vue-slider .vue-slider-process.prevision-indicator {    
    background: repeating-linear-gradient(to right, #ffffff, #ffffff 5px, transparent 2px, transparent 10px );
}
.vue-slider .vue-slider-marks .vue-slider-mark{
    display:none;
}

.vue-slider .catastrophe-dot {
    display:inline-block;
    top: -10px;
    border: 5px solid #ff0000;
    border-radius: 5px;
    height:5px;
    width:5px;
    z-index:6;

}

@media screen and (min-width: 768px) {
    .vue-slider .vue-slider-marks .vue-slider-mark:nth-child(5n+1),
    .vue-slider .vue-slider-marks .vue-slider-mark:nth-last-child(2),
    .vue-slider .vue-slider-marks .vue-slider-mark:last-child{
        display:block;
    }
}

@media screen and (max-width: 768px) {
    .vue-slider .vue-slider-marks .vue-slider-mark:nth-child(10n+1),
    .vue-slider .vue-slider-marks .vue-slider-mark:nth-last-child(2),
    .vue-slider .vue-slider-marks .vue-slider-mark:last-child{
        display:block;
    }
}

.vue-slider .vue-slider-process {
    background: var(--background-process);
}
</style>
