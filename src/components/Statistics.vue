<template>
    <div v-if="targetReachedOn !== undefined"
        class="card bg-danger text-white d-flex flex-row align-items-center justify-content-center p-1 ps-2 pe-2">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <i18n-t keypath="statistic_target_reached_on">
            <strong class="ms-1">{{ targetReachedOn }}</strong>
        </i18n-t>
    </div>
    <div class="card">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-statistics" aria-expanded="true" aria-controls="body-statistics"
                id="heading-statistics" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                {{ $t('statistics') }}
            </a>
        </h5>
        <ul id="body-statistics" class="list-group list-group-flush" aria-labelledby="heading-statistics">
            <li v-for="{ value, template } of statistics"
                class="list-group-item d-flex flex-row align-items-center p-1 ps-2 pe-2" ref="rows">
                <i class="bi me-2" :class="template.icon_classes"></i>
                <span class="flex-grow-1">
                    <span>{{ $t(`statistic_${template.key}`) }}</span>
                    <a v-if="$t(`statistic_help_${template.key}`)" class="link" role="button" tabindex="0"
                        data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right"
                        data-bs-trigger="focus" :data-bs-content="$t(`statistic_help_${template.key}`)"
                        :title="$t(`statistic_${template.key}`)">
                        <i class="bi bi-question-circle-fill m-0"></i>
                    </a>
                </span>
                <span class="text-nowrap fw-bold">
                    {{ $n(value, template.format_name) }}
                </span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { RegionStatistics } from '@/models/yearly_data';
import { useStatisticStore } from '@/stores/statistics';
import { allStatTemplates, StatTemplate } from '@/utils/stat_helpers';
import { Popover } from 'bootstrap';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        year: {
            type: Number,
            default: 0
        },
        district: {
            type: Number,
            default: 0
        }
    },
    setup() {
        return {
            store: useStatisticStore(),
            rows: ref<HTMLElement[]>([]),
            popovers: [] as Popover[]
        };
    },
    mounted() {
        this.popovers.length = 0;
        for (const elem of this.rows) {
            const button = elem.querySelector('[data-bs-toggle="popover"]');
            if (button) {
                const popover = new Popover(button, {
                    html: true
                });
                this.popovers.push(popover);
            }
        }
    },
    computed: {
        statistics(): { value: number, template: StatTemplate }[] {
            const stats = this.store.findStatistics(this.year, this.district);
            const result = [];
            for (const template of allStatTemplates) {
                const value = stats[template.key];
                if (value !== undefined) {
                    result.push({ value, template });
                }
            }
            return result;
        },
        targetReachedOn(): number | undefined {
            return this.store.getYearOverTarget(this.district);
        }
    }
});
</script>

<style scoped>
#body-statistics .bi {
    margin-right: 0.5ch;
    font-size: 1.1em;
}

.stat {
    font-size: 1em;
}
</style>