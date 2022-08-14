
<template>
    <div id="legend">
        <select v-model="store.district">
            <option :value="0">Province de Québec</option>
            <option v-for="district of store.allDistricts" :value="district.id">{{ district.name }}</option>
        </select>
        <div v-if="store.selectedData.info">
            <h2>Statistiques</h2>
            <ul>
                <li v-if="store.selectedData.targetReachedOn">
                    <img src="/icons/attention.png" class="attention"> Dépassement du 1,5 °C: {{store.selectedData.targetReachedOn }}
                </li>
                <li v-if="store.selectedData.info.avg_temp != undefined">
                    Température moyenne: {{ store.selectedData.info.avg_temp.toLocaleString('fr', { maximumFractionDigits: 1 }) }} °C
                </li>
                <li>
                    Augmentation par rapport à 1990: {{ store.selectedData.info.temp_increase.toLocaleString('fr', { maximumFractionDigits: 1 }) }} °C
                </li>
                <li v-if="store.selectedData.info.avg_prec != undefined">
                    Précipitations moyennes: {{ store.selectedData.info.avg_prec.toLocaleString('fr', { maximumFractionDigits: 0 }) }} mm
                </li>
            </ul>
        </div>
        <div v-if="!store.selectedData.candidates.isEmpty()">
            <h2>Candidat(e)s</h2>
            <ul id="candidates">
                <li v-for="candidate of store.selectedData.candidates" class="candidate">
                    <span class="party" :class="candidate.party.toLowerCase()">{{ candidate.party }}</span> 
                    <span class="name">{{ candidate.name }}</span>
                </li>
            </ul>
        </div>
        <div id="catastrophes" v-if="!store.selectedData.catastrophes.isEmpty()">
            <h2>Catastrophes</h2>
            <ul>
                <li v-for="catastrophe of store.selectedData.catastrophes">
                    <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                        <time :datetime="catastrophe.date.toISOString()">{{ dateFormat.format(catastrophe.date)
                        }}</time>:
                        <span>{{ formatDescription(catastrophe) }}</span>
                        <span v-if="catastrophe.city">
                            à {{ catastrophe.city }}
                        </span>
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
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        }
    }
})
</script>

<style scoped>
#legend {
    display: flex;
    flex-direction: column;
}

#catastrophes {
    overflow-y: scroll;
}
.attention {
    width: 1.5em;
    height: 1.5em;
    vertical-align: text-bottom;
}

#legend select {
    font-size: large;
    font-weight: bold;
}

#candidates {
    padding: 0;
}

li.candidate {
    display: flex;
    margin: 4px;
    align-content: center;
    justify-content: flex-start;
    align-items: center;
}

li.candidate .party {
    font-size: small;
    color: white;
    font-weight: bold;
    border-radius: 4px;
    text-align: center;
    width: 40px;
    text-transform: capitalize;
}

li.candidate .name {
    margin-left: 0.5em;
}

li.candidate .party.caq {
     background-color: dodgerblue;
}
li.candidate .party.cq {
    background-color: #13876C;
}
li.candidate .party.pcq {
    background-color: cornflowerblue;
}
li.candidate .party.plq {
    background-color: lightcoral;
}
li.candidate .party.pq { 
    background-color: #004C9D; 
}
li.candidate .party.pv {
    background-color: #9ACD32;
}
li.candidate .party.qs {
    background-color: #FF8040;
}
</style>
