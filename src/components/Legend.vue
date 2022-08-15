
<template>
    <div id="legend">
        <select class="form-select" aria-label="Circonscription" v-model="store.district">
            <option :value="0">Province de Québec</option>
            <option v-for="district of store.allDistricts" :value="district.id">{{ district.name }}</option>
        </select>
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
                        {{ tempFormat.format(store.selectedData.info.temp_increase) }}°C
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
        <div class="card" v-if="!store.selectedData.candidates.isEmpty()">
            <h5 class="card-header">
                <a data-bs-toggle="collapse" href="#body-candidates"
                    aria-expanded="true" aria-controls="body-candidates" id="heading-candidates"
                    class="d-block">
                    <i class="bi bi-chevron-up float-start"></i>
                    Candidat(e)s
                </a>
            </h5>
            <ul id ="body-candidates" class="list-group list-group-flush collapse show" aria-labelledby="heading-candidates"
                ref="candidates">
                <li v-for="candidate of store.selectedData.candidates" class="list-group-item candidate">
                    <span class="party" :class="candidate.party.toLowerCase()" :title="getPartyName(candidate.party)">{{
                            candidate.party
                    }}</span>
                    <span class="name">{{ candidate.name }}</span>
                    <a :href="candidate.email ? 'mailto:' + candidate.email : undefined" title="Courriel">
                        <i class="bi bi-envelope-fill"></i>
                    </a>
                    <a :href="candidate.phone ? 'tel:' + candidate.phone : undefined" title="Téléphone">
                        <i class="bi bi-telephone-fill"></i>
                    </a>
                    <a :href="candidate.address ? 'http://maps.google.com/?q=' + encodeURIComponent(candidate.address) : undefined"
                        title="Adresse" target="_blank">
                        <i class="bi bi-geo-alt-fill"></i>
                    </a>
                    <a :href="candidate.facebook" title="Facebook" target="_blank">
                        <i class="bi bi-facebook"></i>
                    </a>
                    <a :href="candidate.twitter" title="Twitter" target="_blank">
                        <i class="bi bi-twitter"></i>
                    </a>
                </li>
            </ul>
        </div>
        <a v-if="!store.selectedData.candidates.isEmpty()" class="btn btn-success"
            href="https://www.vireauvert.org/envoipropositionspartispolitiques" role="button" target="_blank">
            Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales
        </a>
        <div class="card" id="catastrophes">
            <h5 class="card-header" id="catastrophes-header">
                <a data-bs-toggle="collapse" data-bs-target="#body-catastrophes"
                    aria-expanded="true" aria-controls="body-catastrophes" id="heading-catastrophes"
                    class="d-block">
                    <i class="bi bi-chevron-up float-start"></i>
                    <span>
                        Catastrophes
                    </span>
                    <small class="float-end">{{store.selectedData.catastrophes.size}} en {{store.year}}</small>
                    <div>
                        <small class="d-block float-end">{{getTypeName(store.catastropheType)}}</small>
                    </div>
                </a>
            </h5>
            <div id="body-catastrophes" class="collapse show" aria-labelledby="heading-catastrophes">
                <select class="form-select" aria-label="Type de catastrophe" v-model="store.catastropheType">
                    <option value="">Toutes</option>
                    <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                            getTypeName(catastropheType)
                    }}</option>
                </select>
                <ul class="list-group list-group-flush overflow-auto">
                    <li class="list-group-item" v-for="catastrophe of store.selectedData.catastrophes">
                        <time :datetime="catastrophe.date.toISOString()">{{ dateFormat.format(catastrophe.date) }}</time>:
                        <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                            <span>{{ formatDescription(catastrophe) }}</span>
                            <span v-if="catastrophe.city">
                                à {{ catastrophe.city }}
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { getPartyName } from '@/models/candidates';
import { Catastrophe, CatastropheType, formatDescription, getIconUrl, getTypeName } from '@/models/catastrophes';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';


export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        const catastropheTypes = Object.values(CatastropheType);
        return { store, catastropheTypes };
    },
    data() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: '2-digit'
        });
        const tempFormat = new Intl.NumberFormat('fr-CA', {
            maximumFractionDigits: 1,
        });
        const precFormat = new Intl.NumberFormat('fr-CA', {
            useGrouping: false,
            maximumFractionDigits: 0
        });
        const dayCountFormat = new Intl.NumberFormat('fr-CA', {
            maximumFractionDigits: 2
        });
        return {
            formatDescription,
            getPartyName,
            getIconUrl,
            getTypeName,
            dateFormat,
            tempFormat,
            precFormat,
            dayCountFormat
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

.card-header .bi {
    transition: .3s transform ease-in-out;
    margin-right: 5px;
}

.card-header .collapsed .bi {
    transform: rotate(180deg);
}

.card-header a[data-bs-toggle="collapse"] {
    all: unset;  /* remove styling on toggling hyperlink */
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
    color: red;
}

.stat {
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
