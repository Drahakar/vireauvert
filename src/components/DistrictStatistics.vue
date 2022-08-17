
<template>
    <div class="card">
        <h5 class="card-header"><i class="bi bi-percent"></i> Statistiques</h5>
        <div class="list-group list-group-flush" v-if="statistics">
            <div class="list-group-item stat" v-if="targetReachedOn">
                <i class="bi bi-exclamation-triangle attention"></i>
                Augmentation de 1,5°C dépassée en <strong>{{ targetReachedOn }}</strong>
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="statistics.avg_temp != undefined">
                <i class="bi bi-thermometer"></i> Température moyenne:
                <strong>{{ tempFormat.format(statistics.avg_temp) }}°C
                    <span v-if="statistics.temp_delta">({{ relativeTempFormat.format(statistics.temp_delta)
                    }}°C)</span></strong>
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="statistics.avg_prec != undefined">
                <i class="bi bi-cloud-rain"></i>
                Précipitations totales:
                <strong>{{ precFormat.format(statistics.avg_prec) }} mm</strong>
            </div>
            <div class="w-100"></div>
            <div class="list-group-item stat" v-if="statistics.days_above_30 != undefined">
                <i class="bi bi-thermometer-sun"></i>
                Nombres de jours au dessus de 30°C:
                <strong>{{ dayCountFormat.format(statistics.days_above_30) }}</strong>
            </div>
            <div class="list-group-item stat" v-if="statistics.days_below_min_25 != undefined">
                <i class="bi bi-thermometer-snow"></i>
                Nombres de jours sous -25°C:
                <strong>{{ dayCountFormat.format(statistics.days_below_min_25) }}</strong>
            </div>
        </div>
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
.attention {
    color: red;
}

.stat {
    display: flex;
    gap: 1ch;
}
</style>