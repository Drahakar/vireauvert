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
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius);
    font-size: var(--sz-400);
    color: var(--clr-blanc);
    background-color: var(--color-accent);
    width: 5ch;
    text-align: center;
    padding: 2px 0;
}
span {
    height: 100%;
    display: block;
    font-size: var(--sz-500);
}
</style>
