<template>
    <div class="timeline">
        <div id="slider-header">
            <div id="slider-title" v-t="`timeline_mode_${mode}`"></div>
            <div id="mode-container">
                <div class="item" v-for="value of Object.values(TimelineMode)" :title="$t(`timeline_mode_${value}`)"
                    :data-tutorial-step="value == TimelineMode.CatastropheCount ? 'timeline-catastrophes-count' : ''">
                    <input name="mode" type="radio" :id="`radio-${value}`" :value="value" :checked="mode === value"
                        @change="mode = value" :class="value">
                    <label :for="`radio-${value}`" :class="{active: value === mode, inactive: value !== mode}">
                        <img :src="`/Button/${value}.svg`" :alt="value">
                    </label>
                </div>
            </div>
            
        </div>
        <div class="timeline-container">
            <div class="timeline-graph">
                <!-- set width to 0 to let it auto-size it with given height. -->
                <Line v-if="mode === TimelineMode.Temperature" :chart-data="temperatureData" :height="100" :width="0"
                    :chart-options="temperatureOptions" />
                <Bar v-if="mode === TimelineMode.CatastropheCount" :chart-data="catastropheData" :height="100"
                    :width="0" :chart-options="catastropheOptions" />
            </div>
            <div class="slider-container" ref="sliderContainer">
                <vue-slider v-model="selectedValue" :tooltip="'always'" :marks="marks" :included="true" :min="0"
                    :max="VISUAL_YEARS.totalYearsPadded - 1" :drag-on-click="true">
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
    </div>
</template>

<script lang="ts">
import VueSlider, { Mark, Marks } from 'vue-slider-component'
import { Map, Repeat, fromJS } from 'immutable';
import { computed, PropType, defineComponent, ref } from 'vue';
import 'vue-slider-component/theme/default.css'
import { CONTINUOUS_YEARS, CURRENT_YEAR, MAX_HISTORICAL_YEAR, MODELED_YEARS, TIMELINE_YEARS } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { useStatisticStore } from '@/stores/statistics';
import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from '@/models/catastrophes';
import { TEMPERATURE_THEME } from '@/utils/colours';
import { InterpolatedYears } from '@/utils/interpolated_years';
import { Line, Bar } from 'vue-chartjs'
import { getRelativePosition } from 'chart.js/helpers';
import TimelineArrow from './TimelineArrow.vue';
import { Chart as ChartJS, ChartEvent, ActiveElement, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ScriptableContext, Filler, ChartData, ChartOptions, CoreScaleOptions, Scale, Plugin } from 'chart.js'
import { numberFormats } from '@/locales/formats';
import { END_NOTCH, START_NOTCH } from './Thermometer.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler)
ChartJS.defaults.font.family = "Matter";

enum TimelineMode {
    Temperature = "Temperature",
    CatastropheCount = "Catastrophes"
}

// This many years are added before and between modeled years, to produce some
// visual padding. See InterpolatedYears for more info.
const INTERPOLATED_PADDING_YEARS = 2;
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
        const mode = ref(TimelineMode.Temperature);
        const catastropheStore = useCatastropheStore();
        const statisticStore = useStatisticStore();

        const sliderContainer = ref<HTMLDivElement | null>(null);
        const onAfterFit = (axis: Scale<CoreScaleOptions>) => {
            if (sliderContainer.value) {
                // Update slider margins to align them properly with the chart
                // On the left, we minimally add the width of the Y axis so the slider
                // begins with the chart itself.
                // Additionnally, in catastrophe mode, we add half of bar's width on
                // either side so that the edges of the timeline correspond to the centre
                // of both the first and last bars. This is necessary to avoid a misalignment
                // between the timeline and the chart in that mode
                switch (mode.value) {
                    case TimelineMode.Temperature:
                        sliderContainer.value.style.marginLeft = `${axis.width}px`;
                        sliderContainer.value.style.marginRight = '';
                        break;
                    case TimelineMode.CatastropheCount:
                        const offset = axis.chart.width / VISUAL_YEARS.totalYearsPadded / 2;
                        sliderContainer.value.style.marginLeft = `${axis.width + offset}px`;
                        sliderContainer.value.style.marginRight = `${offset}px`;
                        break;
                    default:
                        sliderContainer.value.style.marginLeft = '';
                        sliderContainer.value.style.marginRight = '';
                }
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
                        tickWidth: 3,
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
            plugins: {
                verticalLine: {
                    index: VISUAL_YEARS.yearToIndex(MAX_HISTORICAL_YEAR),
                },
            },
            scales: {
                y: {
                    ticks: {
                        stepSize: 2,
                        format: numberFormats.temperature_delta_int,
                    },
                    max: END_NOTCH,
                    min: START_NOTCH
                },
            },
        }))).toJS() as ChartOptions<'line'>;

        const catastropheOptions = baseOptions.mergeDeep(Map(fromJS({
            plugins: {
                verticalLine: {
                    index: VISUAL_YEARS.yearToIndex(CURRENT_YEAR),
                },
            },
            scales: {
                y: {
                    ticks: {
                        stepSize: 100,
                    },
                },
            },
        }))).toJS() as ChartOptions<'bar'>;

        return {
            selectedValue,
            catastropheStore,
            statisticStore,
            mode,
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
            const lastHistoricalIndex = VISUAL_YEARS.yearToIndex(MAX_HISTORICAL_YEAR);
            // Split up in two charts to get a break for future values
            const historicalData = (data.slice(0, lastHistoricalIndex + 1) as ChartElem[]).concat(
                Repeat(null as ChartElem, data.length - lastHistoricalIndex - 1).toArray());
            const predictedData = Repeat(null as ChartElem, lastHistoricalIndex).toArray().concat(
                data.slice(lastHistoricalIndex));
            const datasetBase = {
                fill: true,
                spanGaps: false,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                borderColor: 'rgba(255, 106, 14, 0.35)',
                clip: 200,
            };
            return {
                labels: indices,
                datasets: [
                    {
                        ...datasetBase,
                        data: historicalData,
                        backgroundColor: this.makeGradientGenerator(1.0),
                    },
                    {
                        ...datasetBase,
                        data: predictedData,
                        backgroundColor: this.makeGradientGenerator(0.3),
                    },
                ],
            } as ChartData<'line'>;
        },
        catastropheData() {
            const { indices, data } = VISUAL_YEARS.interpolate(
                TIMELINE_YEARS.map(year => this.catastropheStore.countCatastrophes(year, this.district, this.catastropheFilter ?? FILTER_ALL_CATASTROPHES)));
            // Future years have unknown values, set null to replace
            // interpolated values.
            const lastPastIndex = VISUAL_YEARS.yearToIndex(CURRENT_YEAR);
            const pastData = (data.slice(0, lastPastIndex + 1) as ChartElem[]).concat(
                Repeat(null, data.length - lastPastIndex - 1).toArray());
            return {
                labels: indices,
                datasets: [
                    {
                        data: pastData,
                        borderWidth: 0.2,
                        backgroundColor: '#f0ad00',
                        barThickness: 'flex',
                        categoryPercentage: 0.9,
                        barPercentage: 0.75,
                        borderRadius: 4,
                        // borderSkipped: "false",
                        inflateAmount: 0.5,
                        clip: 200,           
                    },
                ]
            } as ChartData<'bar'>;
        }
    },
    methods: {
        generateMarks(): Marks {
            return TIMELINE_YEARS.reduce((marks, year) => {
                const index = VISUAL_YEARS.yearToIndex(year);
                marks[index] = {
                    value: index,
                    label: year.toString(),
                } as Mark;
                return marks;
            }, {} as Marks);
        },
        makeGradientGenerator(alpha: number): GradientGenerator {
            return (ctx: ScriptableContext<'line'>) => {
                const canvas = ctx.chart.ctx;
                const chartArea = ctx.chart.chartArea;
                if (!chartArea) return;  // not set on init
                const yAxis = ctx.chart.scales.y;
                const gradient = canvas.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                for (const stop of TEMPERATURE_THEME.toGradientStops(yAxis.min, yAxis.max)) {
                    gradient.addColorStop(stop.ratio, stop.colour.toHex(alpha));
                }
                return gradient;
            };
        },
    },
});

class VerticalLinePlugin implements Plugin {

    id: string;

    constructor() {
        this.id = 'verticalLine';
    }

    afterDatasetsDraw(chart: ChartJS, args: {}, options: any) {
        const meta = chart.getDatasetMeta(0);
        const index: number = options.index;
        const x = meta.data[index].x;
        const scale = chart.scales.y;
        const context = chart.ctx;

        context.setLineDash([4, 2]);
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = '#74746f';
        context.moveTo(x, scale.top + 2);
        context.lineTo(x, scale.bottom - 2);
        context.stroke();
    }
};

ChartJS.register(new VerticalLinePlugin());

</script>

<style scoped>
#slider-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--sz-800);
    margin-left: -4px;
    margin-bottom: 8px;
}

#slider-title {
    font-size: var(--sz-500);
    padding-left: var(--sz-200);
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
    height: 80%;
    width: 1px;
    border-left-width: 3px;
    border-left-style: dotted;
    border-left-color: var(--clr-brun-terreux);
    display: block;
    margin: auto;
    z-index: var(--tooltip-line-z-index);
}

.vue-slider-dot-tooltip-text,
.vue-slider-dot-tooltip-inner.vue-slider-dot-tooltip-inner-top {
    background-color: var(--clr-orange);
}

.vue-slider .vue-slider-dot-tooltip-inner.vue-slider-dot-tooltip-inner-top {
    padding: calc(var(--sz-10) / 2) var(--sz-30);
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

    .vue-slider .vue-slider-mark .vue-slider-mark-label:is([data-year^='2030'],
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
    left: -2px;
    border-radius: 50%;
    background-color: var(--clr-gris-mi-fonce);
}

.timeline {
    padding-left: 4px;
    padding-top: 4px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
    margin-bottom: 2px;
}

.timeline-container {
    /* Undo the timeline component padding to push to the left side */
    margin-left: calc(0px - var(--timeline-horizontal-padding));
    padding: 0 calc(var(--timeline-horizontal-padding) + var(--sz-50)) var(--sz-50) var(--timeline-horizontal-padding);
    cursor: pointer;
}

.graph-unit {
    left: -7px;
    top: -17px;
}


#mode-container {
    background-color: var(--clr-brun-terreux);
    border-radius: var(--border-radius);
    margin: calc(var(--border-radius) / 4);
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
    padding: 2px 2px;
}

#mode-container .item {
    width: calc(var(--sz-800) - 4px);
    height: calc(var(--sz-800) - 4px);
}

#mode-container input {
    display: none;
}

#mode-container label {
    display: block;
    cursor: pointer;
    border-radius: 50%;
    width: 100%;
    height: 100%;
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

#mode-container label.inactive:hover {
    transform: scale(1.2);
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
    height: calc(76px + var(--sz-30));
    top: var(--sz-30) !important;
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
