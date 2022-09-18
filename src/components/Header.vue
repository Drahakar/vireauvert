<template>
    <header>
        <button @click="about">
            <img src="/Logo_EQT-Bleuet_Map.png" alt="Éqt*x(*)">
        </button>
        <button @click="about">
            <img src="/Logo_terreOS_Map.png" alt="terreOS">
        </button>
    </header>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    emits: ['about-requested'],
    methods: {
        about() {
            this.$emit('about-requested');
        }
    }
});
</script>

<style scoped>
header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 18px;
    color: var(--clr-blanc);
}

button {
    pointer-events: auto;
    max-height: var(--sz-800);
}

img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}
</style>
