<template>
    <a href="https://www.vireauvert.org/envoipropositionspartispolitiques"
        role="button" target="_blank" v-t="'call_to_action'">
    </a>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
})
</script>
<style scoped>
a {
    font-size: var(--sz-400);
    color: var(--clr-blanc);
    background-color: var(--color-accent);
    border-radius: var(--sz-600);
    width: min-content;
    border: none;
    cursor: pointer;
    padding: var(--sz-100);
    text-align: center;
    text-decoration: none;
    /* TODO: style on hover? */
}
</style>
