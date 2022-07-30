<template>
    <div id="timeline">
        <div class="slidercontainer">
            <vue-slider 
                v-model="selectedYear" 
                :tooltip="'active'" 
                :min="1970" 
                :max="2050" 
                :interval="10" 
                :marks="true"
                :adsorb="false"></vue-slider>
        </div> 
    </div>
</template>

<script lang="ts">
import VueSlider from 'vue-slider-component'
import { defineComponent } from 'vue';
import 'vue-slider-component/theme/default.css'

export default defineComponent({
    async mounted() {
    },
    data: function() {
        return {
            selectedYear: 2022
        }
    },
    components: {
        VueSlider
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
    margin-top:25px;
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