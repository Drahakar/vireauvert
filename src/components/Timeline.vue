<template>
    <div class="timeline row">
        <div id="slidertitle" class="col-md-2">{{ $t('research_year') }}</div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years" :marks="marks" :adsorb="false">
                <template v-slot:label="{value}">
                    <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                    <div :class="['vue-slider-mark-label', 'custom-label', 'event-count', 'badge', 'text-bg-danger']">{{catastrophesCountByYears(value)}}</div>
                </template>
                <template v-slot:process="{ style }">
                    <div class="vue-slider-process" :style="[style]"></div>
                    <div class="vue-slider-process prevision-indicator" :style="[style, modeledYearsStyle]"></div>
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
import { CatastropheFilter } from '@/models/catastrophes';

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
        return { 
            selectedYear,
            catastropheStore, 
        };
    },
    data() {
        const ratio = TIMELINE_YEARS.filter(x => x <= BEGIN_MODELED_YEAR).length/TIMELINE_YEARS.length;
        return {
            marks: TIMELINE_YEARS.filter(x => x % (this.isMobile ? 10 : 5) === 0),
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
</style>
