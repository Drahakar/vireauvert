<template>
    <div class="modal">
        <div class="header">{{ group.city ? group.city : `${group.location.lat.toFixed(2)},
        ${group.location.lng.toFixed(2)}` }}</div>
        <div id="catastrophe-list">
            <template v-for="instance of group.instances">
                <div class="icon" :class="[`catastrophe-icon-${instance.type.toLowerCase()}`]"></div>
                <i18n-d tag="time" :value="instance.date" format="event_date_short"></i18n-d>
                <div class="details" v-t="{path: 'catastrophe_with_severity', args: { catastrophe: instance }}"></div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { CatastropheGroup, CatastropheType } from '@/models/catastrophes';
import { List } from 'immutable';
import { defineComponent, PropType } from 'vue';

const DUMMY_GROUP: CatastropheGroup = {
    id: '',
    type: CatastropheType.Unknown,
    district: 0,
    location: { lat: 0, lng: 0 },
    city: '',
    loc_approx: true,
    instances: List()
};

export default defineComponent({
    props: {
        group: {
            type: Object as PropType<CatastropheGroup>,
            default: DUMMY_GROUP
        }
    }
});
</script>
<style scoped>
.modal {
  height: 100%;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.header {
    font-size: var(--sz-400);
    background-color: var(--color-background-accent);
    height: var(--sz-900);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);
    display: flex;
    align-items: center;
}

time {
    white-space: nowrap;
    height: var(--sz-700);
    display: flex;
    align-items: center;
}

#catastrophe-list {
    padding: var(--sz-50) var(--sz-10) var(--sz-50) var(--sz-200);
    height: calc(100% - var(--sz-900));
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    column-gap: var(--sz-30);
    row-gap: var(--sz-50);
    grid-template-columns: var(--sz-700) min-content auto;
    font-size: var(--sz-200);
    color: var(--clr-gris-moyen);
    align-items: center;
}

.icon {
    height: var(--sz-700);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 4px;
}

.details {
    padding-top: var(--sz-30);
    padding-bottom: var(--sz-30);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);
    background-color: var(--color-background-accent);
    border-radius: var(--border-radius);
}
</style>
