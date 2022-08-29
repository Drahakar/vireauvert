<template>
    <div class="header">
        <a href="https://www.vireauvert.org/" target="_blank">
            <img class="logo" src="/VAV_2022.png">
        </a>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
})
</script>

<style scoped>
.header {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.logo {
    max-height: 100%;
}

</style>
