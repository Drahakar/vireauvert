<template>
    <div class="card" v-if="store.selectedData.info">
        <h5 class="card-header"><i class="bi bi-percent"></i> Statistiques</h5>
        <div class="container">
            <div class="row">
                <div class="col" v-if="store.selectedData.targetReachedOn">
                    <i class="bi bi-exclamation-triangle attention"></i>
                    Augmentation de 1,5°C dépassée en {{ store.selectedData.targetReachedOn }}
                </div>
                <div class="w-100"></div>
                <div class="col stat" v-if="store.selectedData.info.avg_temp != undefined"
                    title="Température moyenne">
                    <i class="bi bi-thermometer"></i>
                    {{ tempFormat.format(store.selectedData.info.avg_temp) }}°C
                </div>
                <div class="col stat" title="Augmentation par rapport à 1990">
                    <i class="bi bi-thermometer-high"></i>
                    {{ relativeTempFormat.format(store.selectedData.info.temp_increase) }}°C
                </div>
                <div class="w-100"></div>
                <div class="col stat" v-if="store.selectedData.info.avg_prec != undefined"
                    title="Précipitations moyennes">
                    <i class="bi bi-cloud-rain"></i>
                    {{ precFormat.format(store.selectedData.info.avg_prec) }} mm
                </div>
                <div class="col stat" v-if="store.selectedData.info.avg_liq_prec != undefined"
                    title="Précipitations liquides moyennes">
                    <i class="bi bi-cloud-rain-heavy"></i>
                    {{ precFormat.format(store.selectedData.info.avg_liq_prec) }} mm
                </div>
                <div class="w-100"></div>
                <div class="col stat" v-if="store.selectedData.info.days_above_30 != undefined"
                    title="Nombres de jours au dessus de 30°C">
                    <i class="bi bi-thermometer-sun"></i>
                    {{ dayCountFormat.format(store.selectedData.info.days_above_30) }}
                </div>
                <div class="col stat" v-if="store.selectedData.info.days_below_min_25 != undefined"
                    title="Nombres de jours sous -25°C">
                    <i class="bi bi-thermometer-snow"></i>
                    {{ dayCountFormat.format(store.selectedData.info.days_below_min_25) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';


export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        return { store };
    },
    data() {
        const tempOptions = {
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
            maximumFractionDigits: 2
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
    font-weight: bold;
}
</style>
