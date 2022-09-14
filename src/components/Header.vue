<template>
    <header>
        <!-- TODO: proper logo -->
        <p>Éqt*x(*)</p>
        <!-- TODO: proper logo -->
        <p>terre os</p>
    </header>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
})
</script>

<style scoped>
header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 18px;  /* TODO: remove, use logos instead */
    color: var(--clr-blanc);  /* TODO: logo */
}


</style>
