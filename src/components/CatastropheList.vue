
<template>
    <div class="card catastrophes" v-if="showCatastrophes">
        <h5 class="card-header" id="catastrophes-header">
            <span>Catastrophes</span>
            <small class="float-end">{{ catastrophes.size }} en {{ year }}</small>
        </h5>
        <select class="form-select" aria-label="Type de catastrophe"
            v-model="catastropheType" @input="filterCatastrophes">
            <option value="">Toutes</option>
            <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                    getTypeName(catastropheType, true)
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
</template>

<script lang="ts">
import { Catastrophe, CatastropheType, formatDescription, getTypeName } from '@/models/catastrophes';
import { CURRENT_YEAR } from '@/models/constants';
import { useCatastropheStore } from '@/stores/catastrophes';
import { defineComponent, ref } from 'vue';


export default defineComponent({
    emits: ['onRequestCatastropheFocus', 'onFilterCatastrophes'],
    props: {
        year: {
            type: Number,
            default: CURRENT_YEAR
        },
        district: {
            type: Number,
            default: 0
        },
    },
    setup() {
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: 'long'
        });
        const catastropheTypes = Object.values(CatastropheType);
        const catastropheStore = useCatastropheStore();
        const catastropheType = ref<CatastropheType | ''>('');

        return {
            formatDescription,
            getTypeName,
            catastropheTypes,
            dateFormat,
            catastropheType,
            catastropheStore
        }
    },
    computed: {
        catastrophes() {
            return this.catastropheStore.findCatastrophes(
                this.year, this.district, this.catastropheType);
        },
        showCatastrophes() {
            return this.year <= CURRENT_YEAR;
        }
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            // TODO: switch tab
            this.$emit('onRequestCatastropheFocus', catastrophe);
        },
        filterCatastrophes(event: Event) {
            const elem = event.target as HTMLSelectElement;
            this.$emit('onFilterCatastrophes', elem.value);
        }
    }
});
</script>

<style scoped>
.catastrophes {
    min-height: 0;
    overflow-y: auto;
}
</style>
