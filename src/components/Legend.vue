<template>
    <div id="legend">
        <div>Région sélectionné: {{this.region}}</div>
        <div>Effet Observé: Dolor sit amet</div>

    </div>
</template>

<script lang="ts">
export default {
    props: {
        region: String
    },
    async mounted() {
    }
}
</script>

<style scoped>
#legend {
    float:left;
    width: 25%;
    height: 90%;
}
</style>