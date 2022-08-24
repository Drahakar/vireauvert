
<template>
    <div class="card">
        <h5 class="card-header">
            <a data-bs-toggle="collapse" href="#body-statistics" aria-expanded="true" aria-controls="body-statistics"
                id="heading-statistics" class="d-block">
                <i class="bi bi-chevron-up float-start"></i>
                {{ $t('statistics') }}
            </a>
        </h5>
        <table id="body-statistics" class="table table-bordered table-sm align-middle"
            aria-labelledby="heading-statistics">
            <tbody>
                <tr v-for="template of templates" ref="rows"
                    :style="{ visibility: statistics[template.key] !== undefined ? 'visible' : 'collapse' }">
                    <td><i class="bi" :class="template.icon_classes"></i>{{ $t(`statistic_${template.key}`) }}
                        <a v-if="$t(`statistic_help_${template.key}`)" class="link" role="button" tabindex="0"
                            data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right"
                            data-bs-trigger="focus" :data-bs-content="$t(`statistic_help_${template.key}`)"
                            :title="$t(`statistic_${template.key}`)">
                            <i class="bi bi-question-circle-fill m-0"></i>
                        </a>
                    </td>
                    <td class="text-end text-nowrap fw-bold stat">
                        {{ formatStatistic(template, statistics) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { useStatisticStore } from '@/stores/statistics';
import { allStatTemplates, ExtendedStatistics, StatTemplate } from '@/utils/stat_helpers';
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
            templates: allStatTemplates,
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
        statistics(): ExtendedStatistics {
            return {
                ... this.store.findStatistics(this.year, this.district),
                target_reached_on: this.store.getYearOverTarget(this.district)
            }
        }
    },
    methods: {
        formatStatistic(template: StatTemplate, statistics: ExtendedStatistics) {
            const value = statistics[template.key];
            if (value !== undefined) {
                return this.$n(value, template.format_name);
            }
            return '';
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
    min-width: 9ch;
}
</style>