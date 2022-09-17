<template>
    <header>
        <button @click="about">Éqt*x(*)</button>
        <button @click="about">terre os</button>
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
}
</style>
