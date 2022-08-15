<template>
    <div id="timeline">
        <div id="slidertitle">Année de recherche</div>
        <div id="slidercontainer">
            <vue-slider 
                v-model="store.year"
                :tooltip="'always'"
                :data="years"
                :min="min"
                :max="max"
                :marks="yearsMarks"
                :lazy="true"
                :adsorb="false">
            </vue-slider>
        </div>
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'
import { MIN_CONTINUOUS_YEAR, MAX_CONTINUOUS_YEAR, PAST_REFERENCE_YEAR, FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2, TIMELINE_YEARS, useStore } from '@/stores/store';

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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

#slidertitle {
    font-weight: bold;
    font-size: 1.2em;
}

#slidercontainer {
    flex-grow: 1;
    margin-left: 30px;
}

#slidercontainer input {
    -webkit-appearance: none;
    background: #ffffff;
    outline: none;
    opacity: 1
}
</style>