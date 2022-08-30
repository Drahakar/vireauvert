<template>
    <div class="timeline row">
        <div id="slidertitle" class="col-md-2" v-t="'research_year'"></div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years" :marks="marks" :adsorb="false" :rail-style="temperatureGradientStyle">
                <template v-slot:label="{value}">
                <div class="markline"></div>
                    <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                </template>
                <template v-slot:process="{ style}">
                    <div class="vue-slider-process" :style="[style]"></div>
                    <div class="vue-slider-process prevision-indicator" :style="[style, modeledYearsStyle]"></div>
                </template>
                <template v-slot:step="{value}">
                    <div :class="['catastrophe-dot', catastropheCountSizeClass(value)]"></div>
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

 function generateTemperatureGradient(statisticStore: ReturnType<typeof useStatisticStore>, district: number): String[] {
        const yearRatio = (1 / TIMELINE_YEARS.length * 100);
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
    computed: {
        temperatureGradientStyle() {
            const gradient = generateTemperatureGradient(this.statisticStore, this.district).join(",")
            return {
                '--background-process': `linear-gradient(to right, ${gradient})`
            }
        },
    },
    methods: {
        catastrophesCountByYears(year: number): Number {
            return this.catastropheStore.findCatastrophes(year, this.district, this.catastropheFilter).size;
        },
        catastropheCountSizeClass(year: number): String {
            const catastropheCount = this.catastrophesCountByYears(year);
            if(catastropheCount === 0) {
                return 'catastrophe-size-none';
            } else if (catastropheCount > 50) {
                return 'catastrophe-size-large';
            } else if (catastropheCount > 20) {
                return 'catastrophe-size-medium';
            } else {
                return 'catastrophe-size-small'
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
.vue-slider .vue-slider-mark .vue-slider-mark-label{
    display:none;
}

.vue-slider .catastrophe-dot {
    display:inline-block;
    top: -10px;
    border: 5px solid #d36767;
    border-radius: 5px;
    left:-2px;
    z-index:8;
    width:100%;
    height:100%;

}

.vue-slider .catastrophe-dot.catastrophe-size-none {
    display:none;
}

.vue-slider .catastrophe-dot.catastrophe-size-medium {
    border: 8px solid #d36767;
    border-radius: 8px;
    top: -8px;
    left: -6px
}


.vue-slider .catastrophe-dot.catastrophe-size-large {
    border: 10px solid #d36767;
    border-radius: 10px;
    top: -8px;
    left: -8px;
}


@media screen and (max-width: 768px) {
    .timeline {
        padding:30px 15px;
    }

    .vue-slider .catastrophe-dot {
        display:inline-block;
        top: -13px;
        border: 3px solid #d36767;
        border-radius: 3px;
        left:-2px;
        z-index:8;
        width:100%;
        height:100%;
    }
    .vue-slider .catastrophe-dot.catastrophe-size-medium {
        border: 4px solid #d36767;
        border-radius: 4px;
        top: -12px;
        left: -6px
    }


    .vue-slider .catastrophe-dot.catastrophe-size-large {
        border: 5px solid #d36767;
        border-radius: 5px;
        top: -11px;
        left: -6px;
    }

    .vue-slider .vue-slider-mark:last-of-type .markline {
        border-left: .5px solid;
        height: 10px;
        border-color: #ccc;
        width: 1px;
        top: -14px;
    }

     .vue-slider .vue-slider-mark:last-of-type .custom-label.vue-slider-mark-label {
        top: -45px;
    }
}



@media screen and (min-width: 768px) {
    .vue-slider .vue-slider-mark:nth-child(5n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-label{
        display:block;
    }
}

@media screen and (max-width: 768px) {
    .vue-slider .vue-slider-mark:nth-child(10n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-label{
        display:block;
    }
}
</style>

<style>
.vue-slider .vue-slider-rail {
    background: var(--background-process);
}
.vue-slider .vue-slider-process {
    background-color: transparent;
}
</style>
