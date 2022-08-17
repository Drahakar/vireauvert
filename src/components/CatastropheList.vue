
<template>
    <div class="card" id="catastrophes" v-if="showCatastrophes">
        <h5 class="card-header" id="catastrophes-header">
            <a data-bs-toggle="collapse" data-bs-target="#body-catastrophes" aria-expanded="true"
                aria-controls="body-catastrophes" id="heading-catastrophes" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                <span>
                    Catastrophes
                </span>
                <small class="float-end">{{ catastrophes.size }} en {{ year }}</small>
                <div>
                    <small class="d-block float-end" v-if="catastropheType">{{
                            getTypeName(catastropheType)
                    }}</small>
                    <small class="d-block float-end" v-else>Toutes</small>
                </div>
            </a>
        </h5>
        <div id="body-catastrophes" class="collapse" aria-labelledby="heading-catastrophes" ref="catastrophesElem">
            <select class="form-select" aria-label="Type de catastrophe" v-model="catastropheType">
                <option value="">Toutes</option>
                <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                        getTypeName(catastropheType)
                }}</option>
            </select>
            <ul class="list-group list-group-flush overflow-auto">
                <li class="list-group-item" v-for="catastrophe of catastrophes">
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
import { Catastrophe, CatastropheType, formatDescription, getTypeName } from '@/models/catastrophes';
import { CURRENT_YEAR } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { Collapse } from 'bootstrap';
import { defineComponent, PropType, ref } from 'vue';


export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    props: {
        year: {
            type: Number,
            default: CURRENT_YEAR
        },
        district: {
            type: Number,
            default: 0
        },
        catastropheType: {
            type: String as PropType<CatastropheType | ''>,
            default: ''
        }
    },
    setup() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: '2-digit'
        });
        const catastropheTypes = Object.values(CatastropheType);
        const store = useCatastropheStore();
        const catastrophesElem = ref<HTMLElement | null>(null);
        return {
            formatDescription,
            getTypeName,
            catastropheTypes,
            dateFormat,
            catastrophesElem,
            store
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
    computed: {
        catastrophes() {
            return this.store.findCatastrophes(this.year, this.district);
        },
        showCatastrophes() {
            return this.year <= CURRENT_YEAR;
        }
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        },
    }
});
</script>

<style scoped>
#catastrophes {
    min-height: 0;
    overflow-y: auto;
}
</style>