<template>
    <div class="card catastrophes" v-if="showCatastrophes()">
        <h5 class="card-header" id="catastrophes-header">
            <span>
                Catastrophes
            </span>
            <small class="float-end">{{ store.selectedData.catastrophes.size }} en {{ store.year }}</small>
        </h5>
        <select class="form-select" aria-label="Type de catastrophe" v-model="store.catastropheType">
            <option value="">Toutes</option>
            <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                    getTypeName(catastropheType)
            }}</option>
        </select>
        <ul class="list-group list-group-flush overflow-auto">
            <li class="list-group-item" v-for="catastrophe of store.selectedData.catastrophes">
                <time :datetime="catastrophe.date.toISOString()">{{ dateFormat.format(catastrophe.date)
                }}</time>:
                <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                    <span>{{ formatDescription(catastrophe) }}</span>
                    <span v-if="catastrophe.city">
                        à {{ catastrophe.city }}
                    </span>
                </a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">

import { Catastrophe, CatastropheType, formatDescription, getIconUrl, getTypeName } from '@/models/catastrophes';
import { useStore, CURRENT_YEAR } from '@/stores/store';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        const catastropheTypes = Object.values(CatastropheType);
        return { store, catastropheTypes };
    },
    data() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: '2-digit'
        });
        return {
            formatDescription,
            getIconUrl,
            getTypeName,
            dateFormat,
        }
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            // TODO: switch tab
            this.$emit('onRequestCatastropheFocus', catastrophe);
        },
        showCatastrophes() {
            // TODO: if we switch future year while on catastrophes tab, it
            // shows an empty tab -- show a message then.
            return this.store.year <= CURRENT_YEAR;
        }
    }
})
</script>

<style scoped>

.catastrophes {
    min-height: 0;
    overflow-y: auto;
}

/* TODO: either remove collapsing, or move to global css classes for re-use. */
.card-header .bi {
    transition: .3s transform ease-in-out;
    margin-right: 5px;
}

.card-header .collapsed .bi {
    transform: rotate(180deg);
}

.card-header a[data-bs-toggle="collapse"] {
    all: unset;
    /* remove styling on toggling hyperlink */
}

</style>

