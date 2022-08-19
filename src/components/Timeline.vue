<template>
    <div id="timeline" class="row">
        <div id="slidertitle" class="col-md-2">Année de recherche</div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="selectedYear" :tooltip="'always'" :data="years" :marks="yearsMarks"
                :lazy="true" :adsorb="false">
            </vue-slider>
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { computed, defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'
import { TIMELINE_YEARS, MAX_CONTINUOUS_YEAR, MIN_CONTINUOUS_YEAR, FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2 } from '@/models/constants';

export default defineComponent({
    components: { VueSlider },
    emits: ['yearSelected'],
    props: {
        year: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const selectedYear = computed({
            get: () => props.year,
            set: value => emit('yearSelected', value)
        });
        return { selectedYear };
    },
    data() {
        return {
            yearsMarks: TIMELINE_YEARS.filter(x => x % 5 === 0),
            years: TIMELINE_YEARS
        }
    }
})
</script>

<style scoped>
#timeline {
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
</style>
