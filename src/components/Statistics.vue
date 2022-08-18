
<template>
    <div class="card">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-statistics" aria-expanded="true" aria-controls="body-statistics"
                id="heading-statistics" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                Statistiques
            </a>
        </h5>
        <table id="body-statistics" class="table table-bordered table-sm" aria-labelledby="heading-statistics">
            <tbody>
                <tr v-if="targetReachedOn !== undefined">
                    <td><i class="bi bi-exclamation-triangle text-danger"></i>Année de dépassement du 1,5°C par rapport à 1990</td>
                    <td class="fw-bold text-end">{{ targetReachedOn }}</td>
                </tr>
                <tr v-if="statistics.avg_temp != undefined">
                    <td><i class="bi bi-thermometer-half"></i>Température moyenne</td>
                    <td class="fw-bold text-end">{{ tempFormat.format(statistics.avg_temp) }}°C</td>
                </tr>
                <tr v-if="statistics.temp_delta != undefined">
                    <td><i class="bi bi-thermometer-high"></i>Variation de la température moyenne depuis 1990</td>
                    <td class="fw-bold text-end">{{ relativeTempFormat.format(statistics.temp_delta) }}°C</td>
                </tr>
                <tr v-if="statistics.avg_prec != undefined">
                    <td><i class="bi bi-cloud-rain"></i>Précipitations totales</td>
                    <td class="fw-bold text-end">{{ precFormat.format(statistics.avg_prec) }}&nbsp;mm</td>
                </tr>
                <tr v-if="statistics.days_above_30 != undefined">
                    <td><i class="bi bi-thermometer-sun"></i>Nombres de jours au dessus de 30°C</td>
                    <td class="fw-bold text-end">{{ dayCountFormat.format(statistics.days_above_30) }}</td>
                </tr>
                <tr v-if="statistics.days_below_min_25 != undefined">
                    <td><i class="bi bi-thermometer-snow"></i>Nombres de jours sous -25°C</td>
                    <td class="fw-bold text-end">{{ dayCountFormat.format(statistics.days_below_min_25) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { RegionStatistics } from '@/models/yearly_data';
import { useStatisticStore } from '@/stores/statistics';
import { defineComponent } from 'vue';


export default defineComponent({
    props: {
        year: {
            type: Number,
            default: 0
        },
        district: {
            type: Number,
            default: 0
        }
    },
    setup() {
        const store = useStatisticStore();
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
            store,
            tempFormat,
            relativeTempFormat,
            precFormat,
            dayCountFormat
        };
    },
    computed: {
        statistics(): RegionStatistics {
            return this.store.findStatistics(this.year, this.district);
        },
        targetReachedOn(): number | undefined {
            return this.store.getYearOverTarget(this.district)
        }
    }
});
</script>

<style scoped>
#body-statistics .bi {
    margin-right: 1ch;
}
</style>