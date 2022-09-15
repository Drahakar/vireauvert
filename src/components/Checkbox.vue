<template>
    <input type="checkbox" />
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
})
</script>
<style scoped>
input[type="checkbox"] {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
    background-color: var(--color-background-accent);
    width: var(--sz-700);
    height: var(--sz-700);
    border-radius: 8px;
    box-shadow: 0px var(--sz-30) var(--sz-30)
        rgba(255, 255, 255, 0.04),
        inset 0px -1px 0px rgba(255, 255, 255, 0.66),
        inset 0px 1px 2px rgba(0, 0, 0, 0.2);
    display: grid;
    place-content: center;
}

input[type="checkbox"]::before {
    content: "";
    transform: scale(0);
    width: var(--sz-700);
    height: var(--sz-700);
    transform-origin: bottom left;
    background-image: url("/icons/check.svg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
}

input[type="checkbox"]:checked::before {
    transform: scale(1);
}
</style>

