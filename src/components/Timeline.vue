<template>
    <div id="timeline">
        <div class="slidercontainer">
            <vue-slider 
                v-model="store.year"
                :tooltip="'active'"
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
        const min = 1970;
        const max = 2050;
        const marks = [...Array(((max - min) / 10) + 1).keys()].map(x => min + (x * 10));
        return {
            min,
            max,
            marks
        }
    }
})
</script>

<style scoped>
#timeline {
    width: 100%;
    height: 10%;
}

.slidercontainer {
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    z-index: 29;
    padding: 0px 30px;
    margin-top: 37px;
}

.slidercontainer input {
    -webkit-appearance: none;
    width: 100%;
    height: 100%;
    background: #ffffff;
    outline: none;
    opacity: 1
}
</style>