
<template>
    <div class="card" v-if="!candidates.isEmpty()">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-candidates" aria-expanded="true" aria-controls="body-candidates"
                id="heading-candidates" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                <span v-if="district">Candidat(e)s</span>
                <span v-else>Chefs de partis</span>
            </a>
        </h5>
        <ul id="body-candidates" class="list-group list-group-flush collapse show" aria-labelledby="heading-candidates"
            ref="candidates">
            <li v-for="candidate of candidates" class="list-group-item candidate">
                <span class="party" :class="candidate.party.toLowerCase()" :title="getPartyName(candidate.party)">{{
                        candidate.party
                }}</span>
                <span class="name">{{ candidate.name }}</span>
                <a :href="candidate.facebook" title="Facebook" target="_blank">
                    <i class="bi bi-facebook"></i>
                </a>
            </li>
        </ul>
    </div>
    <a v-if="!candidates.isEmpty()" class="btn btn-success"
        href="https://www.vireauvert.org/envoipropositionspartispolitiques" role="button" target="_blank">
        Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales
    </a>
</template>

<script lang="ts">
import { getPartyName } from '@/models/candidates';
import { useCandidateStore } from '@/stores/candidates';
import { defineComponent } from 'vue';


export default defineComponent({
    props: {
        district: {
            type: Number,
            default: 0
        }
    },
    setup() {
        const store = useCandidateStore();
        return { store, getPartyName }
    },
    computed: {
        candidates() {
            return this.store.candidatesByDistrict(this.district);
        }
    }
});
</script>

<style scoped>
.candidate {
    display: flex;
    align-items: center;
    gap: 0.4em;
}

.candidate>a {
    font-size: 1.5em;
}

.candidate>a:not([href]) {
    opacity: 0.3;
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