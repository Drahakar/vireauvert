<template>
    <div id="timeline" class="row">
        <div id="slidertitle" class="col-md-2">Année de recherche</div>
        <div id="slidercontainer" class="col-md-10">
            <vue-slider v-model="store.year" :tooltip="'always'" :data="years" :min="min" :max="max" :marks="yearsMarks"
                :lazy="true" :adsorb="false">
            </vue-slider>
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'
import { TIMELINE_YEARS, MAX_CONTINUOUS_YEAR, MIN_CONTINUOUS_YEAR, PAST_REFERENCE_YEAR, FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2 } from '@/models/constants';
import { useStore } from '@/stores/store';

export default defineComponent({
    components: {
        VueSlider
    },
    setup() {
        const store = useStore();
        return {
            store
        };
    },
    data() {
        return {
            min: Math.min(...TIMELINE_YEARS),
            max: Math.max(...TIMELINE_YEARS),
            yearsMarks: [...Array(((MAX_CONTINUOUS_YEAR - MIN_CONTINUOUS_YEAR) / 5) + 1).keys()].map(x => MIN_CONTINUOUS_YEAR + (x * 5)).concat(PAST_REFERENCE_YEAR, FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2).sort(),
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
