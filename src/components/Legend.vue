
<template>
    <div id="legend">
        <select class="form-select" aria-label="Circonscription" v-model="store.district">
            <option :value="0">Province de Québec</option>
            <option v-for="district of store.allDistricts" :value="district.id">{{ district.name }}</option>
        </select>
        <div class="card" v-if="store.selectedData.info">
            <div class="card-header">Statistiques</div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-if="store.selectedData.targetReachedOn">
                    <img src="/icons/attention.png" class="attention"> Dépassement du 1,5 °C:
                    {{ store.selectedData.targetReachedOn }}
                </li>
                <li class="list-group-item" v-if="store.selectedData.info.avg_temp != undefined">
                    <i class="bi bi-thermometer"></i>
                    Température moyenne: {{ tempFormat.format(store.selectedData.info.avg_temp) }} °C
                </li>
                <li class="list-group-item">
                    <i class="bi bi-thermometer-high"></i>
                    Augmentation par rapport à 1990: {{ tempFormat.format(store.selectedData.info.temp_increase) }} °C
                </li>
                <li class="list-group-item" v-if="store.selectedData.info.avg_prec != undefined">
                    <i class="bi bi-cloud-rain"></i>
                    Précipitations moyennes: {{ precFormat.format(store.selectedData.info.avg_prec) }} mm
                </li>
            </ul>
        </div>
        <div class="card" v-if="!store.selectedData.candidates.isEmpty()">
            <div class="card-header">Candidat(e)s</div>
            <ul class="list-group list-group-flush">
                <li v-for="candidate of store.selectedData.candidates" class="list-group-item candidate">
                    <span class="party" :class="candidate.party.toLowerCase()" :title="getPartyName(candidate.party)">{{ candidate.party }}</span>
                    <span class="name">{{ candidate.name }}</span>
                    <a :href="candidate.email ? 'mailto:' + candidate.email : undefined" title="Courriel">
                        <i class="bi bi-envelope-fill"></i>
                    </a>
                    <a :href="candidate.phone ? 'tel:' + candidate.phone : undefined" title="Téléphone">
                        <i class="bi bi-telephone-fill"></i>
                    </a>
                    <a :href="candidate.address ? 'http://maps.google.com/?q=' + encodeURIComponent(candidate.address) : undefined"
                        title="Adresse">
                        <i class="bi bi-geo-alt-fill"></i>
                    </a>
                    <a :href="candidate.facebook" title="Facebook">
                        <i class="bi bi-facebook"></i>
                    </a>
                    <a :href="candidate.twitter" title="Twitter">
                        <i class="bi bi-twitter"></i>
                    </a>
                </li>
            </ul>
        </div>
        <div class="card" v-if="!store.selectedData.catastrophes.isEmpty()" id="catastrophes">
            <div class="card-header">Catastrophes</div>
            <ul class="list-group list-group-flush overflow-auto">
                <li class="list-group-item" v-for="catastrophe of store.selectedData.catastrophes">
                    <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                        <time :datetime="catastrophe.date.toISOString()">{{ dateFormat.format(catastrophe.date) }}</time>:
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

import { getPartyName } from '@/models/candidates';
import { Catastrophe, formatDescription, getIconUrl } from '@/models/catastrophes';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';


export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        return { store };
    },
    data() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: 'long'
        });
        const tempFormat = new Intl.NumberFormat('fr-CA', {
            maximumFractionDigits: 1
        });
        const precFormat = new Intl.NumberFormat('fr-CA', {
            maximumFractionDigits: 0
        })
        return {
            formatDescription,
            getPartyName,
            getIconUrl,
            dateFormat,
            tempFormat,
            precFormat
        }
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
    gap: 10px;
}

#catastrophes {
    min-height: 0;
}

.candidate {
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.candidate .name {
    flex-grow: 1;
}

.candidate a {
    opacity: 0.5;
}

.candidate a[href] {
    opacity: 1;
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

.candidate .party {
    font-size: small;
    color: white;
    font-weight: bold;
    border-radius: 4px;
    text-align: center;
    width: 42px;
    text-transform: capitalize;
    padding: 2px;
}

.candidate .name {
    margin-left: 0.5em;
}

.candidate .party.caq {
    background-color: dodgerblue;
}

.candidate .party.cq {
    background-color: #13876C;
}

.candidate .party.pcq {
    background-color: cornflowerblue;
}

.candidate .party.plq {
    background-color: lightcoral;
}

.candidate .party.pq {
    background-color: #004C9D;
}

.candidate .party.pv {
    background-color: #9ACD32;
}

.candidate .party.qs {
    background-color: #FF8040;
}
</style>
