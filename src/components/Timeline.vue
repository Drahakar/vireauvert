<template>
    <div class="timeline">
        <div id="slidertitle" v-t="'research_year'"></div>
        <div id="timelinegraph">
            <!-- set width to 0 to let it auto-size it with given height. -->
            <Line
                :chart-data="chartData"
                :height="70"
                :width="0"
                :chart-options="chartOptions"/>
            <!-- Apparently it's not possible not to display the Y axis label not rotated https://github.com/chartjs/Chart.js/issues/8345 -->
            <span class="graph-unit">C</span>
        </div>
        <div id="slidercontainer">
            <vue-slider
                v-model="selectedYear"
                :tooltip="'always'"
                :data="years"
                :marks="marks"
                :adsorb="false" >
                <template v-slot:label="{value}">
                    <div class="markline"></div>
                    <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                </template>
                <template v-slot:step="{ active }">
                    <div :class="['vue-slider-mark-step', {'vue-slider-mark-step-active': active}]"></div>
                </template>
                <template v-slot:tooltip="{ value }">
                    <div class="vue-slider-dot-tooltip vue-slider-dot-tooltip-top vue-slider-dot-tooltip-show">
                        <div class="tooltip-line"></div>
                        <div class="vue-slider-dot-tooltip-inner vue-slider-dot-tooltip-inner-top">
                            <span class="vue-slider-dot-tooltip-text">{{ value }}</span>
                        </div>
                    </div>
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
import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from '@/models/catastrophes';
import { Line } from 'vue-chartjs'
import { getRelativePosition } from 'chart.js/helpers';
import CandidateList from './CandidateList.vue';
import { Chart as ChartJS, ChartEvent, ActiveElement, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ScriptableContext, Filler} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler)


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
            type: Object as PropType<CatastropheFilter>,
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
                onClick: (e: ChartEvent, tooltipItems: ActiveElement[], chart: ChartJS) => {
                    const canvasPosition = getRelativePosition(e, chart)
                    const yearId = chart.scales.x.getValueForPixel(canvasPosition.x);  
                    this.$emit('yearSelected', TIMELINE_YEARS[yearId??0]);
                },
                scales: {
                    x: {
                        display: false,
                    },
                    y: {
                        ticks: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    filler: {
                        propagate: true
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            }   
        }
    },
    computed: {
        chartData() {
            return {
                labels: TIMELINE_YEARS,
                datasets: [
                    {
                        data:TIMELINE_YEARS.map(year => this.statisticStore.findStatistics(year, this.district).temp_delta ?? 0),
                        fill: true,
                        borderWidth: 0,
                        pointRadius:0,
                        backgroundColor: (ctx: ScriptableContext<'line'>) => {
                            const canvas = ctx.chart.ctx;
                            const gradient = canvas.createLinearGradient(0,0,0,90);

                            //TODO: mettre le bon gradiant et les bonnes couleurs
                            gradient.addColorStop(0, 'red');
                            gradient.addColorStop(0.25, 'orange');
                            gradient.addColorStop(0.6, 'lightblue');
                            

                            return gradient;
                        },
                    }
                ]
            };
        }
    },
    methods: {
        catastrophesCountByYears(year: number): Number {
            return this.catastropheStore.findCatastrophes(year, this.district,
                this.catastropheFilter ?? FILTER_ALL_CATASTROPHES).size;
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
    margin-top: -27px;
    margin-bottom: var(--sz-100);
}

.vue-slider-mark-label.custom-label.event-count {
    top:-32px;
}

.vue-slider .tooltip-line {
    height: 60px;
    width: 1px;
    border-width: 1px;
    border-style: dashed;
    display: block;
    top: 39px;
    margin: auto;
}

.vue-slider .vue-slider-dot-tooltip-inner.vue-slider-dot-tooltip-inner-top{
    top: -42px; 
    padding: 2px 10px; 
    border-radius: 14px
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
        margin-left: 8px;
        margin-right: 5px;
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
        margin-top: 0;
    }
}

.graph-unit {
    left: -7px;
    top: -17px;
}
</style>

<style>
.vue-slider .vue-slider-rail,
.vue-slider .vue-slider-process {
    background-color: transparent;
}

.vue-slider-dot-tooltip-inner-top::after {
    display:none;
}
</style>
