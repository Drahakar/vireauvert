<template>
    <div class="card">
        <h5 class="card-header"><i class="bi bi-percent"></i> Statistiques</h5>
        <div class="list-group list-group-flush" v-if="store.selectedData.info">
            <div class="list-group-item stat" v-if="store.selectedData.targetReachedOn">
                <i class="bi bi-exclamation-triangle attention"></i>
                Augmentation de 1,5°C dépassée en {{ store.selectedData.targetReachedOn }}
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="store.selectedData.info.avg_temp != undefined">
                <i class="bi bi-thermometer"></i> Température moyenne:
                <strong>{{ tempFormat.format(store.selectedData.info.avg_temp) }}°C
                ({{ relativeTempFormat.format(store.selectedData.info.temp_increase) }}°C)</strong>
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="store.selectedData.info.avg_prec != undefined">
                <i class="bi bi-cloud-rain"></i>
                Précipitations totales:
                <strong>{{ precFormat.format(store.selectedData.info.avg_prec) }} mm</strong>
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="store.selectedData.info.days_above_30 != undefined">
                <i class="bi bi-thermometer-sun"></i>
                Nombres de jours au dessus de 30°C:
                <strong>{{ dayCountFormat.format(store.selectedData.info.days_above_30) }}</strong>
            </div>
            <div class="list-group-item stat" v-if="store.selectedData.info.days_below_min_25 != undefined">
                <i class="bi bi-thermometer-snow"></i>
                Nombres de jours sous -25°C:
                <strong>{{ dayCountFormat.format(store.selectedData.info.days_below_min_25) }}</strong>
            </div>
        </div>
        <div v-else class="text-center">Aucune statistique pour cette région et année.</div>
    </div>
</template>

<script lang="ts">

import RegionSearch from "./RegionSearch.vue";
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const store = useStore();
        return { store };
    },
    data() {
        const tempOptions: Intl.NumberFormatOptions = {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }
        const tempFormat = new Intl.NumberFormat('fr-CA', tempOptions);
        const relativeTempFormat = new Intl.NumberFormat('fr-CA', {
            ...tempOptions, signDisplay: "always",
        });
        const precFormat = new Intl.NumberFormat('fr-CA', {
            useGrouping: false,
            maximumFractionDigits: 0
        });
        const dayCountFormat = new Intl.NumberFormat('fr-CA', {
            maximumFractionDigits: 0
        });
        return {
            tempFormat,
            relativeTempFormat,
            precFormat,
            dayCountFormat
        }
    },
})
</script>

<style scoped>

.attention {
    color: red;
}

.stat {
    display: flex;
    gap: 1ch;
    align-items: center;
}

.stat .bi {
    font-size: 1.1em;
}

</style>
