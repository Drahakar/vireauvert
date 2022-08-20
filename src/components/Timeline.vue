<template>
    <div class="timeline row">
        <div id="slidertitle" class="col-md-2">{{ $t('research_year') }}</div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years" :marks="marks" :adsorb="false">
                <template v-slot:label="{value}">
                    <div :class="['vue-slider-mark-label', 'custom-label']">{{value}}</div>
                    <div :class="['vue-slider-mark-label', 'custom-label', 'event-count', 'badge', 'text-bg-danger']">{{catastrophesCountByYears(value)}}</div>
                </template>
                  <template v-slot:step="{value}">
                    <div :class="['vue-slider-mark-label', 'custom-label', 'event-count']">{{catastrophesCountByYears(value)}}</div>
                </template>
            </vue-slider>
            
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { computed, PropType, defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'
import { TIMELINE_YEARS, } from '@/models/constants';
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
        return {
            marks: TIMELINE_YEARS.filter(x => x % (this.isMobile ? 10 : 5) === 0),
            years: TIMELINE_YEARS
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
</style>
