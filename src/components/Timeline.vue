<template>
    <div id="timeline">
        <div id="slidertitle">Année de recherche</div>
        <div id="slidercontainer">
            <vue-slider 
                v-model="store.year"
                :tooltip="'always'"
                :min="min"
                :max="max"
                :marks="marks"
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
import { MAX_YEAR, MIN_YEAR, useStore } from '@/stores/store';

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
        const marks = [...Array(((MAX_YEAR - MIN_YEAR) / 5) + 1).keys()].map(x => MIN_YEAR + (x * 5));
        return {
            min: MIN_YEAR,
            max: MAX_YEAR,
            marks
        }
    }
})
</script>

<style scoped>
#timeline {
    width: 100%;
    height: 10%;
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