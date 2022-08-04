
<template>
    <div id="legend">
        <select v-model="store.district">
            <option :value="0">Québec</option>
            <option v-for="district of store.allDistricts" :value="district.id">{{ district.name }}</option>
        </select>
        <div>Année de recherche: {{ store.year }}</div>
        <div v-if="store.statisticsForCurrentYearAndDistrict">
            Statistiques
            <ul>
                <li v-if="store.statisticsForCurrentYearAndDistrict.average_temperature !== null">
                    Température moyenne: {{ store.statisticsForCurrentYearAndDistrict.average_temperature }} °C
                </li>
                <li v-if="store.statisticsForCurrentYearAndDistrict.average_precipitations !== null">
                    Précipitations moyennes: {{ store.statisticsForCurrentYearAndDistrict.average_precipitations }} mm
                </li>
            </ul>
        </div>
        <div id="catastrophes">
            Catastrophes
            <ul>
                <li v-for="catastrophe of store.catastrophesForCurrentYearAndDistrict">
                    <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                        [{{ catastrophe.id }}] 
                        {{ dateFormat.format(catastrophe.date) }}: 
                        {{ formatDescription(catastrophe) }} à {{ catastrophe.city }}
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

import { Catastrophe, formatDescription } from '@/models/catastrophes';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';

export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: 'long'
        });
        return { store, formatDescription, dateFormat };
    },
    async mounted() {
        await this.store.updateCatastrophes();
        await this.store.loadRegions();
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        }
    }
})
</script>

<style scoped>
#legend {
    float: left;
    width: 25%;
    height: calc(90% - 10px);
    ;
    padding: 10px;
}

#catastrophes {
    overflow-y: scroll;
    height: calc(100% - 10px);
}

#legend select {
    font-size: large;
    font-weight: bold;
}
</style>
