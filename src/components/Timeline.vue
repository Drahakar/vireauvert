<template>
    <div class="timeline">
        <div id="slidertitle" v-t="`timeline_mode_${mode}`">
        </div>
        <div class="timeline-container">
            <div class="timeline-graph">
                <!-- set width to 0 to let it auto-size it with given height. -->
                <Line v-if="mode === TimelineMode.Temperature" :chart-data="temperatureData" :height="90" :width="0"
                    :chart-options="temperatureOptions" />
                <Bar v-if="mode === TimelineMode.CatastropheCount" :chart-data="catastropheData" :height="90" :width="0"
                    :chart-options="catastropheOptions" />
            </div>
            <div class="slider-container" ref="sliderContainer">
                <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years"
                    :marks="marks" :adsorb="true" :drag-on-click="true">
                    <template v-slot:label="{value}">
                        <div class="markline"></div>
                        <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                    </template>
                    <template v-slot:step="{ active }">
                        <div :class="['vue-slider-mark-step', {'vue-slider-mark-step-active': active}]"></div>
                    </template>
                    <template v-slot:tooltip="{ value }">
                        <div class="vue-slider-dot-tooltip-inner vue-slider-dot-tooltip-inner-top"
                            data-tutorial-step="year-selector">
                            <span class="vue-slider-dot-tooltip-text">{{ value }}</span>
                        </div>
                        <div class="tooltip-line"></div>
                    </template>
                    <template v-slot:dot>
                        <TimelineArrow class="slider-arrow"></TimelineArrow>
                    </template>
                </vue-slider>
            </div>
        </div>
        <div id="mode-container">
            <div class="item" v-for="value of Object.values(TimelineMode)" :title="$t(`timeline_mode_${value}`)">
                <input name="mode" type="radio" :id="`radio-${value}`" :value="value" :checked="mode === value"
                    @change="mode = value" :class="value">
                <label :for="`radio-${value}`" :class="{active: value === mode}">
                    <img :src="`/Button/${value}.svg`" :alt="value">
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { Map } from 'immutable';
import { computed, PropType, defineComponent, ref } from 'vue';
import 'vue-slider-component/theme/default.css'
import { TIMELINE_YEARS, BEGIN_MODELED_YEAR } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { useStatisticStore } from '@/stores/statistics';
import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from '@/models/catastrophes';
import { Line, Bar } from 'vue-chartjs'
import { getRelativePosition } from 'chart.js/helpers';
import TimelineArrow from './TimelineArrow.vue';
import { Chart as ChartJS, ChartEvent, ActiveElement, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ScriptableContext, Filler, ChartData, Color, ChartOptions, CoreScaleOptions, Scale } from 'chart.js'
import { numberFormats } from '@/locales/formats';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler)
ChartJS.defaults.font.family = "Matter";

enum TimelineMode {
    Temperature = "Temperature",
    CatastropheCount = "Catastrophes"
}

export default defineComponent({
    components: { VueSlider, Line, TimelineArrow, Bar },
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

        const sliderContainer = ref<HTMLDivElement | null>(null);
        const onAfterFit = (axis: Scale<CoreScaleOptions>) => {
            if (sliderContainer.value) {
                sliderContainer.value.style.marginLeft = `${axis.width}px`;
            }
        };
        const baseOptions = Map({
            onClick: (e: ChartEvent, tooltipItems: ActiveElement[], chart: ChartJS) => {
                const canvasPosition = getRelativePosition(e, chart)
                const yearId = chart.scales.x.getValueForPixel(canvasPosition.x);
                emit('yearSelected', TIMELINE_YEARS[yearId ?? 0]);
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
                },
            },
            layout: {
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    display: true,
                    afterFit: onAfterFit,
                    color: '#353535',
                    grid: {
                        tickLength: 5,
                        tickWidth: 1,
                        drawBorder: false,
                        drawOnChartArea: true,
                        tickColor: "#a59e20",
                    },
                },
            },
            responsive: true,
            maintainAspectRatio: false,
        });

        const temperatureOptions = baseOptions.mergeDeep(Map({
            scales: {
                y: {
                    ticks: {
                        stepSize: 2,
                        format: numberFormats.temperature_delta_int,
                    }
                },
            },
        })).toObject() as ChartOptions<'line'>;

        const catastropheOptions = baseOptions.mergeDeep(Map({
            scales: {
                y: {
                    ticks: {
                        stepSize: 100,
                    }
                },
            },
        })).toObject() as ChartOptions<'bar'>;

        return {
            selectedYear,
            catastropheStore,
            statisticStore,
            mode: ref(TimelineMode.Temperature),
            sliderContainer,
            TimelineMode,
            temperatureOptions,
            catastropheOptions,
        };
    },
    data() {
        const ratio = TIMELINE_YEARS.filter(x => x <= BEGIN_MODELED_YEAR).length / TIMELINE_YEARS.length;
        return {
            marks: TIMELINE_YEARS,
            years: TIMELINE_YEARS,
            modeledYearsStyle: [
                'left:' + (ratio * 100) + '%',
                'width:' + ((1 - ratio) * 100) + '%'
            ]
        };
    },
    computed: {
        temperatureData() {
            const data: ChartData<'line'> = {
                labels: TIMELINE_YEARS,
                datasets: [
                    {
                        data: TIMELINE_YEARS.map(year => this.statisticStore.findStatistics(year, this.district).temp_delta ?? 0),
                        fill: true,
                        borderWidth: 0,
                        pointRadius: 0,
                        backgroundColor: (ctx: ScriptableContext<'line'>) => {
                            const canvas = ctx.chart.ctx;
                            const gradient = canvas.createLinearGradient(0, 0, 0, 90);

                            //TODO: mettre le bon gradiant et les bonnes couleurs
                            gradient.addColorStop(0, 'red');
                            gradient.addColorStop(0.5, 'orange');
                            gradient.addColorStop(0.8, 'lightblue');

                            return gradient;
                        },
                    }
                ]
            };
            return data;
        },
        catastropheData() {
            const data: ChartData<'bar'> = {
                labels: TIMELINE_YEARS,
                datasets: [
                    {
                        data: TIMELINE_YEARS.map(year => this.catastropheStore.countCatastrophes(year, this.district, this.catastropheFilter ?? FILTER_ALL_CATASTROPHES)),
                        borderWidth: 0,
                        backgroundColor: '#f0ad00'
                    }
                ]
            };
            return data;
        }
    }
});
</script>

<style scoped>
#slidertitle {
    font-size: var(--sz-400);
    margin-bottom: var(--sz-50);
}

.slider-container input {
    -webkit-appearance: none;
    background: #ffffff;
    outline: none;
    opacity: 1;
}

.slider-container {
    margin-bottom: var(--sz-100);
}

.vue-slider-mark-label.custom-label.event-count {
    top: -32px;
}

.vue-slider .tooltip-line {
    height: 100%;
    margin-top: 1px;
    width: 1px;
    border-width: 1px;
    border-style: dashed;
    display: block;
    margin: auto;
    z-index: var(--tooltip-line-z-index);
}

.vue-slider-dot-tooltip-text,
.vue-slider-dot-tooltip-inner.vue-slider-dot-tooltip-inner-top {
    background-color: var(--clr-orange);
}

.vue-slider .vue-slider-dot-tooltip-inner.vue-slider-dot-tooltip-inner-top {
    padding: 2px 10px;
    border-radius: var(--border-radius);
}

.vue-slider .vue-slider-process.prevision-indicator {
    background: repeating-linear-gradient(to right, #ffffff, #ffffff 5px, transparent 2px, transparent 10px);
}

.vue-slider .vue-slider-mark .vue-slider-mark-label,
.vue-slider .vue-slider-mark .vue-slider-mark-step {
    display: none;
}

.vue-slider .vue-slider-mark .vue-slider-mark-label {
    margin-top: var(--sz-30);
    font-size: var(--sz-300);
}

.vue-slider .vue-slider-mark .vue-slider-mark-step {
    width: 200%;
    height: 200%;
    top: -2px;
    border-radius: 50%;
    background-color: var(--clr-gris-mi-fonce);
}

.timeline {
    padding: var(--sz-50) var(--timeline-horizontal-padding);
}

.timeline-container {
    /* Undo the timeline component padding to push to the left side */
    margin-left: calc(0px - var(--timeline-horizontal-padding));
}

@media screen and (min-width: 768px) {

    .vue-slider .vue-slider-mark:nth-child(5n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-child(5n+1) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-step {
        display: block;
    }
}

@media screen and (max-width: 768px) {

    .vue-slider .vue-slider-mark:nth-child(10n+1) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-child(10n+1) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-label,
    .vue-slider .vue-slider-mark:nth-last-child(2) .vue-slider-mark-step,
    .vue-slider .vue-slider-mark:last-child .vue-slider-mark-step {
        display: block;
    }
}

.graph-unit {
    left: -7px;
    top: -17px;
}


#mode-container {
    position: absolute;
    right: 4px;
    top: 4px;
    background-color: var(--clr-brun-terreux);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
}

#mode-container input {
    display: none;
}

#mode-container label {
    display: block;
    width: var(--sz-700);
    height: var(--sz-700);
    cursor: pointer;
    border-radius: 50%;
}

#mode-container label img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    filter: invert(60%) sepia(20%) saturate(1493%) hue-rotate(19deg) brightness(95%) contrast(88%);
}

#mode-container label.active {
    background-color: var(--clr-orange);
}

#mode-container label.active img {
    filter: brightness(100%);
}
</style>

<style>
.vue-slider {
    --slider-dot-size: var(--sz-900);
    --tooltip-line-height: calc(90px - var(--slider-dot-size));
    --tooltip-line-gap: var(--sz);
    --tooltip-line-z-index: 0;
}

.vue-slider .vue-slider-rail,
.vue-slider .vue-slider-process {
    background-color: var(--clr-gris-pale);
}

.vue-slider-dot-tooltip-inner-top::after {
    display: none;
}

.vue-slider-dot-tooltip {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 80px;
    top: unset !important;
}

.vue-slider-dot-tooltip-inner {
    font-size: var(--sz-400);
}

.vue-slider-dot {
    /* Note: must use !important here to undo the direct 'style' that is applied
       to vue-slider-dot, while still having responsive CSS-var based dims. */
    width: var(--slider-dot-size) !important;
    height: var(--slider-dot-size) !important;
}

.slider-arrow {
    position: absolute;
    z-index: calc(var(--tooltip-line-z-index) + 1);
}
</style>
