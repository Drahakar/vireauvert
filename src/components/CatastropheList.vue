<template>
    <div class="card" id="catastrophes" v-if="showCatastrophes()">
        <h5 class="card-header" id="catastrophes-header">
            <a data-bs-toggle="collapse" data-bs-target="#body-catastrophes" aria-expanded="true"
                aria-controls="body-catastrophes" id="heading-catastrophes" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                <span>
                    Catastrophes
                </span>
                <small class="float-end">{{ store.selectedData.catastrophes.size }} en {{ store.year }}</small>
                <div>
                    <small class="d-block float-end" v-if="store.catastropheType">{{
                            getTypeName(store.catastropheType)
                    }}</small>
                    <small class="d-block float-end" v-else>Toutes</small>
                </div>
            </a>
        </h5>
        <div id="body-catastrophes" class="collapse" aria-labelledby="heading-catastrophes" ref="catastrophesElem">
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
    </div>
</template>

<script lang="ts">

import { Catastrophe, CatastropheType, formatDescription, getIconUrl, getTypeName } from '@/models/catastrophes';
import { useStore, CURRENT_YEAR } from '@/stores/store';
import { defineComponent, ref } from 'vue';
import { Collapse } from 'bootstrap';

export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        const catastropheTypes = Object.values(CatastropheType);
        const catastrophesElem = ref<HTMLElement | null>(null);
        return { store, catastropheTypes, catastrophesElem };
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
    mounted() {
        if (this.catastrophesElem) {
            const catastrophesCollapse = new Collapse(
                this.catastrophesElem, { toggle: false });
            // For large devices, expand catastrophes initially
            if (window.innerWidth >= 768) {
                catastrophesCollapse.show();
            }
        }
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        },
        showCatastrophes() {
            return this.store.year <= CURRENT_YEAR;
        }
    }
})
</script>

<style scoped>

#catastrophes {
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

