<template>
    <div class="timeline row">
        <div id="slidertitle" class="col-md-2" v-t="'research_year'"></div>
        <div class="col-md-10">
            <div id="timelinegraph">
                <Line
                    :chart-data="chartData"
                    :height="100"
                    :chart-options="chartOptions"/>
            </div>
            <div id="slidercontainer">
                <vue-slider 
                    v-model="selectedYear" 
                    :tooltip="'always'" 
                    :data="years" 
                    :marks="marks" 
                    :adsorb="false" 
                    :tooltipStyle="{top: '-52px'}" >
                    <template v-slot:label="{value}">
                        <div class="markline"></div>
                        <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                    </template>
                    <template v-slot:step="{ active }">
                        <div :class="['vue-slider-mark-step', {'vue-slider-mark-step-active': active}]"></div>
                    </template>
                </vue-slider>
            </div>
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
import { Line } from 'vue-chartjs'
import CandidateList from './CandidateList.vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ChartOptions} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)


export default defineComponent({
    components: { VueSlider, CandidateList, Line },
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
            ],
            chartOptions: {
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }   
        }
    },
    computed: {
        chartData() {
            return {
                labels: TIMELINE_YEARS,
                datasets: [{data:TIMELINE_YEARS.map(year => this.statisticStore.findStatistics(year, this.district).temp_delta ?? 0)}]
            };
        }
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

#slidercontainer {
    top: -15px;
}

.vue-slider-mark-label.custom-label.event-count {
    top:-32px;
}

.vue-slider .vue-slider-process.prevision-indicator {    
    background: repeating-linear-gradient(to right, #ffffff, #ffffff 5px, transparent 2px, transparent 10px );
}
.vue-slider .vue-slider-mark .vue-slider-mark-label,
.vue-slider .vue-slider-mark .vue-slider-mark-step{
    display:none;
}

.vue-slider .vue-slider-mark .vue-slider-mark-step {
    width: 120%;
    height: 120%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
}



@media screen and (max-width: 768px) {
    .timeline {
        padding:30px 15px;
    }

    .vue-slider {
        margin: 0px 5px;
    }
}



@media screen and (min-width: 768px) {
    .vue-slider .vue-slider-mark:nth-child(5n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-child(5n+1) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-label{
        display:block;
    }
}

@media screen and (max-width: 768px) {
    .vue-slider .vue-slider-mark:nth-child(10n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-child(10n+1) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-step{
        display:block;
    }
}
</style>

<style>
.vue-slider .vue-slider-rail,
.vue-slider .vue-slider-process {
    background-color: transparent;
}
</style>
