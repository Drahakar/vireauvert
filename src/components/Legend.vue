
<template>
    <div id="legend">
        <div>Région sélectionné: {{region}}</div>
        <div>Catastrophes naturelles</div>
        <div><span v-html="regionnalCatastrophes"></span></div>

    </div>
</template>

<script lang="ts">

import axios from 'axios';
import { defineComponent } from 'vue'

interface ICatastrophes {
    [x: string]: Array<string>;
}

export default defineComponent({
    props: {
        region: String,
    },
    data() {
        return {
            catastrophes: {} as ICatastrophes,
        }
    },
    computed: {
        regionnalCatastrophes() {
            return this.region && this.catastrophes[this.region] ? this.catastrophes[this.region] : new Array<String>();
        }
    },
    async mounted() {
        const catastrophesResponse = await axios.get<ICatastrophes>('data/catastrophes-naturelles.json', { responseType: 'json' });
        this.catastrophes = catastrophesResponse.data;
    }
})
</script>

<style scoped>
#legend {
    float:left;
    width: 25%;
    height: 90%;
}
</style>
