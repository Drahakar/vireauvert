<!-- Similar to bootstrap's "Badge", used to show a numeric count. -->
<template>
    <div><span>{{value}}</span></div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: String,
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
    color: var(--color-background-accent);
    background-color: var(--color-accent);
    width: 5ch;
    text-align: center;
    padding: 2px 0;
}
span {
    display: block;
    font-size: var(--sz-400);
}
</style>
