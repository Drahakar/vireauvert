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
                <vue-slider v-model="selectedValue" :tooltip="'always'"
                    :marks="marks" :included="true" :min="0" :max="VISUAL_YEARS.totalYearsPadded - 1"
                    :adsorb="true" :drag-on-click="true">
                    <template v-slot:label="{value}">
                        <div class="markline"></div>
                        <div :class="['vue-slider-mark-label', 'custom-label']"
                            :data-year="VISUAL_YEARS.indexToYear(value)">
                            {{VISUAL_YEARS.indexToYear(value)}}
                        </div>
                    </template>
                    <template v-slot:step="{ active, value }">
                        <div :class="['vue-slider-mark-step', {'vue-slider-mark-step-active': active}]"
                            :data-year="VISUAL_YEARS.indexToYear(value)"></div>
                    </template>
                    <template v-slot:tooltip="{ value }">
                        <div class="vue-slider-dot-tooltip-inner vue-slider-dot-tooltip-inner-top"
                            data-tutorial-step="year-selector">
                            <span class="vue-slider-dot-tooltip-text">{{ VISUAL_YEARS.indexToYear(value) }}</span>
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
import VueSlider, { Marks, MarkOption } from 'vue-slider-component'
import { Map, Repeat, fromJS } from 'immutable';
import { computed, PropType, defineComponent, ref } from 'vue';
import 'vue-slider-component/theme/default.css'
import { CONTINUOUS_YEARS, MAX_CONTINUOUS_YEAR, MIN_CONTINUOUS_YEAR, MODELED_YEARS, TIMELINE_YEARS } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { useStatisticStore } from '@/stores/statistics';
import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from '@/models/catastrophes';
import { InterpolatedYears } from '@/utils/interpolated_years';
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

// This many years are added before and between modeled years, to produce some
// visual padding. See InterpolatedYears for more info.
const INTERPOLATED_PADDING_YEARS = 3;
const VISUAL_YEARS = new InterpolatedYears(CONTINUOUS_YEARS, MODELED_YEARS,
                                           INTERPOLATED_PADDING_YEARS);

type GradientGenerator = (ctx: ScriptableContext<'line'>) => CanvasGradient | undefined;
type ChartElem = number | null;

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
        const selectedValue = computed({
            get: () => VISUAL_YEARS.yearToIndex(props.year),
            set: value => emit('yearSelected', VISUAL_YEARS.indexToYear(value))
        });
        const catastropheStore = useCatastropheStore();
        const statisticStore = useStatisticStore();

        const sliderContainer = ref<HTMLDivElement | null>(null);
        const onAfterFit = (axis: Scale<CoreScaleOptions>) => {
            if (sliderContainer.value) {
                sliderContainer.value.style.marginLeft = `${axis.width}px`;
            }
        };
        const baseOptions = Map(fromJS({
            onClick: (e: ChartEvent, tooltipItems: ActiveElement[], chart: ChartJS) => {
                const canvasPosition = getRelativePosition(e, chart)
                const value = chart.scales.x.getValueForPixel(canvasPosition.x) ?? 0;
                emit('yearSelected', VISUAL_YEARS.indexToYear(value));
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
        }));

        const temperatureOptions = baseOptions.mergeDeep(Map(fromJS({
            scales: {
                y: {
                    ticks: {
                        stepSize: 2,
                        format: numberFormats.temperature_delta_int,
                    }
                },
            },
        }))).toJS() as ChartOptions<'line'>;

        const catastropheOptions = baseOptions.mergeDeep(Map(fromJS({
            scales: {
                y: {
                    ticks: {
                        stepSize: 100,
                    }
                },
            },
        }))).toJS() as ChartOptions<'bar'>;

        return {
            selectedValue,
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
        return {
            VISUAL_YEARS,
            marks: this.generateMarks(),
        };
    },
    computed: {
        temperatureData() {
            const { indices, data } = VISUAL_YEARS.interpolate(
                TIMELINE_YEARS.map(year => this.statisticStore.findStatistics(year, this.district).temp_delta ?? 0));
            const lastPastIndex = VISUAL_YEARS.yearToIndex(MAX_CONTINUOUS_YEAR);
            // Split up in two charts to get a break for future values
            const pastData = (data.slice(0, lastPastIndex + 1) as ChartElem[]).concat(
                Repeat(null as ChartElem, data.length - lastPastIndex - 1).toArray());
            const futureData = Repeat(null as ChartElem, lastPastIndex + 1).toArray().concat(
                data.slice(lastPastIndex + 1));
            const datasetBase = {
                fill: true,
                spanGaps: false,
                borderWidth: 0,
                pointRadius: 0,
            };
            return {
                labels: indices,
                datasets: [
                    {
                        ...datasetBase,
                        data: pastData,
                        backgroundColor: this.makeGradientGenerator(
                            'rgb(255, 59, 59)', 'rgb(240, 173, 0)',
                            'rgb(244, 243, 231)', 'rgb(0, 90, 173)'),
                    },
                    {
                        ...datasetBase,
                        data: futureData,
                        backgroundColor: this.makeGradientGenerator(
                            'rgba(255, 59, 59, 0.3)', 'rgba(240, 173, 0, 0.3)',
                            'rgba(244, 243, 231, 0.3)', 'rgba(0, 90, 173, 0.3)'),
                    },
                ],
            } as ChartData<'line'>;
        },
        catastropheData() {
            const { indices, data } = VISUAL_YEARS.interpolate(
                TIMELINE_YEARS.map(year => this.catastropheStore.countCatastrophes(year, this.district, this.catastropheFilter ?? FILTER_ALL_CATASTROPHES)));
            // Future years have unknown values, set null to replace
            // interpolated values.
            const lastPastIndex = VISUAL_YEARS.yearToIndex(MAX_CONTINUOUS_YEAR);
            const pastData = (data.slice(0, lastPastIndex + 1) as ChartElem[]).concat(
                Repeat(null, data.length - lastPastIndex - 1).toArray());
            return {
                labels: indices,
                datasets: [
                    {
                        data: pastData,
                        borderWidth: 0,
                        backgroundColor: '#f0ad00'
                    }
                ]
            } as ChartData<'bar'>;
        }
    },
    methods: { 
        generateMarks(): Marks {
            return TIMELINE_YEARS.reduce((marks, year) => {
                marks[VISUAL_YEARS.yearToIndex(year)] = year.toString();
                return marks;
            }, {} as Marks);
        },
        makeGradientGenerator(hotColor: string, warmColor: string,
                              neutralColor: string, coldColor: string
        ): GradientGenerator {
            return (ctx: ScriptableContext<'line'>) => {
                const canvas = ctx.chart.ctx;
                const chartArea = ctx.chart.chartArea;
                if (!chartArea) return;  // not set on init
                const yAxis = ctx.chart.scales.y;
                const zeroRatio = -yAxis.min / (yAxis.max - yAxis.min);
                const gradient = canvas.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

                gradient.addColorStop(0.7, hotColor);
                // put warm color slightly above zero to get a fast transition
                // to non-"invisible" colors, e.g. when neutral is the same as
                // the background color.
                gradient.addColorStop(zeroRatio + 0.03, warmColor);
                gradient.addColorStop(zeroRatio, neutralColor);
                gradient.addColorStop(0, coldColor);

                return gradient;
            };
        },
    },
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

.vue-slider .vue-slider-mark .vue-slider-mark-label[data-year$='0'],
.vue-slider .vue-slider-mark .vue-slider-mark-step[data-year$='0'] {
    display: block;
}

@media only screen and (max-width: 599px) {
    .vue-slider .vue-slider-mark .vue-slider-mark-label:is(
        [data-year^='2030'],
        [data-year^='2050'],
    ) {
        display: none;
    }
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
    padding-right: var(--sz-50);
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
}

#mode-container label.active {
    background-color: var(--clr-orange);
}

#mode-container label.active img {
    filter: brightness(0) invert(1);
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
