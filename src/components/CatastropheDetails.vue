<template>
    <div class="header">{{ group.city ? group.city : `${group.location.lat.toFixed(2)}, ${group.location.lng.toFixed(2)}` }}</div>
    <ul id="catastrophe-list">
        <li v-for="instance of group.instances">
            <div class="icon" :class="[`catastrophe-icon-${instance.type.toLowerCase()}`]"></div>
            <i18n-d tag="time" :value="instance.date" format="event_date_short"></i18n-d>
            <div class="details" v-t="{path: 'catastrophe_with_severity', args: { catastrophe: instance }}"></div>
        </li>
    </ul>
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
.header {
    font-size: var(--sz-400);
    background-color: var(--clr-blanc);
    height: var(--sz-900);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);
    border-radius: var(--popup-border-radius);
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
    padding-left: var(--sz-200);
    padding-right: var(--sz-200);
    padding-bottom: var(--sz-30);
}

#catastrophe-list li {
    list-style: none;
    color: var(--clr-gris-moyen);
    display: flex;
    align-items: center;
    gap: var(--sz-30);
    margin-top: var(--sz-30);
    font-size: var(--sz-200);
}

.icon {
    width: var(--sz-700);
    height: var(--sz-700);
    background-size: var(--sz-700);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    margin-bottom: 4px;
}

.details {
    padding-top: var(--sz-30);
    padding-bottom: var(--sz-30);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);
    background-color: var(--clr-blanc);
    border-radius: var(--border-radius);
    flex-grow: 1;
}
</style>
