
<template>
    <div class="card" v-if="!candidates.isEmpty()">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-candidates" aria-expanded="true" aria-controls="body-candidates"
                id="heading-candidates" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                <template v-if="district">{{ $t('candidates') }}</template>
                <template v-else>{{ $t('party_leaders') }}</template>
            </a>
        </h5>
        <ul id="body-candidates" class="list-group list-group-flush collapse show" ref="candidates">
            <li v-for="candidate of candidates"
                class="list-group-item candidate d-flex align-items-center p-0 ps-2 pe-2">
                <span class="party" :class="candidate.party.toLowerCase()" :title="$t(`party_${candidate.party}`)">
                    {{ $t(`party_acro_${candidate.party}`) }}
                </span>
                <span class="name">{{ candidate.name }}</span>
                <a :href="candidate.facebook" :title="$t('facebook')" target="_blank">
                    <i class="bi bi-facebook"></i>
                </a>
            </li>
        </ul>
    </div>
    <CallToAction :active="!candidates.isEmpty()"></CallToAction>
</template>

<script lang="ts">
import { useCandidateStore } from '@/stores/candidates';
import { defineComponent } from 'vue';
import CallToAction from './CallToAction.vue';


export default defineComponent({
    components: { CallToAction },
    props: {
        district: {
            type: Number,
            default: 0
        }
    },
    setup() {
        const store = useCandidateStore();
        return { store }
    },
    computed: {
        candidates() {
            return this.store.findCandidates(this.district);
        }
    },
});
</script>

<style scoped>
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
    width: 2.3rem;
    text-transform: capitalize;
    padding: 2px;
    margin-right: 0.7ch;
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
