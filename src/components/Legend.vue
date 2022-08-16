
<template>
    <div id="legend">
        <v-select aria-label="Circonscription" :options="getDistrictOptions()" v-model="store.district" label="name"
            :reduce="getDistrictId" :clearable="false">
            <template #no-options="{ search, searching, loading }">
                Désolé, aucune circonscription trouvée avec ce nom.
            </template>
        </v-select>
        <div class="card">
            <h5 class="card-header"><i class="bi bi-percent"></i> Statistiques</h5>
            <div class="container" v-if="store.selectedData.info">
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
            <div v-else class="text-center">Aucune statistique pour cette région et année.</div>
        </div>
        <div class="card" v-if="!store.selectedData.candidates.isEmpty()">
            <h5 class="card-header">
                <a data-bs-toggle="collapse" href="#body-candidates" aria-expanded="true"
                    aria-controls="body-candidates" id="heading-candidates" class="d-block">
                    <i class="bi bi-chevron-up float-start"></i>
                    Candidat(e)s
                </a>
            </h5>
            <ul id="body-candidates" class="list-group list-group-flush collapse show"
                aria-labelledby="heading-candidates" ref="candidates">
                <li v-for="candidate of store.selectedData.candidates" class="list-group-item candidate">
                    <span class="party" :class="candidate.party.toLowerCase()" :title="getPartyName(candidate.party)">{{
                            candidate.party
                    }}</span>
                    <span class="name">{{ candidate.name }}</span>
                    <a v-if="candidate.facebook" :href="candidate.facebook" title="Facebook" target="_blank">
                        <i class="bi bi-facebook"></i>
                    </a>
                </li>
            </ul>
        </div>
        <a v-if="!store.selectedData.candidates.isEmpty()" class="btn btn-success"
            href="https://www.vireauvert.org/envoipropositionspartispolitiques" role="button" target="_blank">
            Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales
        </a>
        <div class="card" id="catastrophes" v-if="showCatastrophes()">
            <h5 class="card-header" id="catastrophes-header">
                <a data-bs-toggle="collapse" data-bs-target="#body-catastrophes" aria-expanded="true"
                    aria-controls="body-catastrophes" id="heading-catastrophes" class="d-block">
                    <i class="bi bi-chevron-up float-start"></i>
                    <span>
                        Catastrophes
                    </span>
                    <small class="float-end">{{ store.selectedData.catastrophes.size }} en {{ store.year }}</small>
                    <div>
                        <small class="d-block float-end" v-if="store.catastropheType">{{
                                getTypeName(store.catastropheType)
                        }}</small>
                        <small class="d-block float-end" v-else>Toutes</small>
                    </div>
                </a>
            </h5>
            <div id="body-catastrophes" class="collapse" aria-labelledby="heading-catastrophes" ref="catastrophesElem">
                <select class="form-select" aria-label="Type de catastrophe" v-model="store.catastropheType">
                    <option value="">Toutes</option>
                    <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                            getTypeName(catastropheType)
                    }}</option>
                </select>
                <ul class="list-group list-group-flush overflow-auto">
                    <li class="list-group-item" v-for="catastrophe of store.selectedData.catastrophes">
                        <time :datetime="catastrophe.date.toISOString()">{{ dateFormat.format(catastrophe.date)
                        }}</time>:
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
import { DistrictProperties } from '@/models/map';
import { useStore, CURRENT_YEAR } from '@/stores/store';
import { defineComponent, ref } from 'vue';
import vSelect from 'vue-select';
import { Collapse } from 'bootstrap';


export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    components: { vSelect },
    setup() {
        const store = useStore();
        const catastropheTypes = Object.values(CatastropheType);
        const catastrophesElem = ref<HTMLElement | null>(null);
        return { store, catastropheTypes, catastrophesElem };
    },
    data() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: '2-digit'
        });
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
            formatDescription,
            getPartyName,
            getIconUrl,
            getTypeName,
            dateFormat,
            tempFormat,
            relativeTempFormat,
            precFormat,
            dayCountFormat
        }
    },
    mounted() {
        if (this.catastrophesElem) {
            const catastrophesCollapse = new Collapse(
                this.catastrophesElem, { toggle: false });
            // For large devices, expand catastrophes initially
            if (window.innerWidth >= 768) {
                catastrophesCollapse.show();
            }
        }
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        },
        getDistrictOptions(): DistrictProperties[] {
            return [{ id: 0, name: "Province de Québec" }].concat(
                this.store.allDistricts);
        },
        getDistrictId(district: DistrictProperties) {
            return district.id;
        },
        showCatastrophes() {
            return this.store.year <= CURRENT_YEAR;
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
    overflow-y: auto;
}

.card-header .bi {
    transition: .3s transform ease-in-out;
    margin-right: 5px;
}

.card-header .collapsed .bi {
    transform: rotate(180deg);
}

.card-header a[data-bs-toggle="collapse"] {
    all: unset;
    /* remove styling on toggling hyperlink */
}

.candidate {
    display: flex;
    align-items: center;
    gap: 0.4em;
}

.candidate>a {
    font-size: 1.5em;
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
