<!-- Similar to bootstrap's "Badge", used to show a numeric count. -->
<template>
    <div><span>{{value}}</span></div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: Number,
    },
})
</script>

<style scoped>
div {
    display: inline;
    border-radius: var(--border-radius);
    font-size: var(--sz-400);
    color: var(--clr-blanc);
    background-color: var(--color-accent);
    padding: 1px var(--sz-50) 2px var(--sz-50);
    width: min-content;
    text-align: center;
}
</style>
