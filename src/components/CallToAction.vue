<template>
    <a v-if="!store.selectedData.candidates.isEmpty()" class="btn btn-success"
        href="https://www.vireauvert.org/envoipropositionspartispolitiques" role="button" target="_blank">
        Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales
    </a>
</template>

<script lang="ts">

import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const store = useStore();
        return { store };
    },
})
</script>
