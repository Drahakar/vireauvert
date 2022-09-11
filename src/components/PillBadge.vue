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
    border-radius: var(--sz-400);
    font-size: var(--sz-400);
    color: var(--clr-blanc);
    background-color: var(--clr-orange);
    padding: 1px var(--sz-50) 2px var(--sz-50);
}
</style>
