<template>
    <a v-if="active" class="btn btn-success"
        href="https://www.vireauvert.org/envoipropositionspartispolitiques" role="button" target="_blank">
        Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales
    </a>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        active: Boolean
    },
})
</script>
