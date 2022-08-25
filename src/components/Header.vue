<template>
    <div class="header">
        <div class="header-logo flex-1">
            <a href="https://www.vireauvert.org/" target="_blank">
                <img class="logo float-end" src="public/VAV_2022.png">
            </a>
        </div>
        <div class="header-info flex-1">
            <!-- TODO: call to action? -->
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
    min-width: 30%;
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
