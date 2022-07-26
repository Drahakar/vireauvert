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

<template>
    <div id="legend">
        <div>Région sélectionné: {{region}}</div>
        <div>Effet Observé: Dolor sit amet</div>

    </div>
</template>