<template>
    <div class="card" v-if="!store.selectedData.candidates.isEmpty()">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-candidates" aria-expanded="true"
                aria-controls="body-candidates" id="heading-candidates" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                <span v-if="store.district">Candidat(e)s</span>
                <span v-else>Chefs de partis</span>
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
</template>

<script lang="ts">

import { getPartyName } from '@/models/candidates';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const store = useStore();
        return { store };
    },
    data() {
        return {
            getPartyName,
        }
    },
})
</script>

<style scoped>

/* TODO: either remove collapsing, or move to global css classes for re-use. */
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
    gap: 1ch;
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
