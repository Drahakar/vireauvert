<template>
    <div class="card catastrophes">
        <h5 class="card-header" id="catastrophes-header">
            <span>{{ $t('catastrophes', 2) }}</span>
            <small v-if="areCatastrophesAvailable" class="float-end">{{ $t('count_by_year', { count: catastrophes.size, year }) }}</small>
        </h5>
        <template v-if="areCatastrophesAvailable">
            <select class="form-select" aria-label="Type de catastrophe" v-model="catastropheType"
                @input="filterCatastrophes">
                <option value="">{{ $t('all', 2) }}</option>
                <option v-for="catastropheType of catastropheTypes" :value="catastropheType">{{
                        $t(`catastrophe_${catastropheType}`, 2)
                }}</option>
            </select>
            <ul class="list-group list-group-flush overflow-auto">
                <li class="list-group-item" v-for="catastrophe of catastrophes">
                    <time :datetime="catastrophe.date.toISOString()">
                        {{ $d(catastrophe.date, 'event_date') }}
                    </time>:
                    <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                        {{ $t('catastrophe_with_severity', { catastrophe, show_city: true }) }}
                    </a>
                </li>
            </ul>
        </template>
        <div class="no-future-catastrophes" v-else>
            {{ $t('no_future_catastrophes') }}
        </div>
    </div>

</template>

<script lang="ts">
import { Catastrophe, CatastropheFilter, CatastropheType } from '@/models/catastrophes';
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
        const catastropheTypes = Object.values(CatastropheType);
        const catastropheStore = useCatastropheStore();
        const catastropheType = ref<CatastropheFilter>('');

        return {
            catastropheTypes,
            catastropheType,
            catastropheStore
        }
    },
    computed: {
        catastrophes() {
            return this.catastropheStore.findCatastrophes(
                this.year, this.district, this.catastropheType);
        },
        areCatastrophesAvailable() {
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

.no-future-catastrophes {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    text-align: center;
}
</style>
