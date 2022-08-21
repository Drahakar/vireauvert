<template>
    <a v-if="active" class="btn btn-success" href="https://www.vireauvert.org/envoipropositionspartispolitiques"
        role="button" target="_blank">
        {{ $t('call_to_action') }}
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
