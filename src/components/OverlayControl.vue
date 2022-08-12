<template>
    <div id="controls">
        <button @click="selectOverlay(null)">Aucun</button>
        <button @click="selectOverlay(averageTemperature)">Température moyenne</button>
        <button @click="selectOverlay(averagePrecipitations)">Précipitations moyennes</button>
    </div>
</template>

<script lang="ts">
import { averagePrecipitations, averageTemperature, StatOverlayControl } from "@/models/meteo_view";
import { useStore } from "@/stores/store";
import { defineComponent } from "vue";
export default defineComponent({
    setup() {
        const store = useStore();
        return { store };
    },
    data() {
        return {
            averageTemperature,
            averagePrecipitations
        }
    },
    methods: {
        selectOverlay(overlay: StatOverlayControl | null) {
            this.store.currentStatOverlay = overlay;
        }
    }
});
</script>

<style scoped>
#controls {
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: space-between;
    gap: 10px;
}
</style>