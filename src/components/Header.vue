<template>
    <div class="header">
        <div class="header-logo flex-1">
            <img class="logo" src="public/VAV_2022.png">
        </div>
        <div class="header-info flex-1">
            <p>ALLO</p>
        </div>
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
    justify-content: space-between;
}

.header-logo {
    min-width: 150px;
    height: 100%;
}

.header-info {
    background-color: #202020;
    color: #fff;
    flex: 1;
}

.logo {
    max-height: 100%;
}
</style>
