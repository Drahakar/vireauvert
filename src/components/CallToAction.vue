<template>
    <a href="https://www.vireauvert.org/envoipropositionspartispolitiques"
        role="button" target="_blank" :aria-label="$t('call_to_action')">
        <img src="/call_to_action.png">
    </a>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
})
</script>
<style scoped>
a {
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    border-radius: 50%;
    width: calc(var(--sz-900) * 2);
    height: calc(var(--sz-900) * 2);
}

img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25),
        inset 0px 0px 2px rgba(0, 0, 0, 0.5);
}
</style>
