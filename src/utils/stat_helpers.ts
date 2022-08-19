import { RegionStatistics } from "@/models/yearly_data";

export interface ExtendedStatistics extends RegionStatistics {
    target_reached_on?: number;
}

export interface StatTemplate {
    key: keyof ExtendedStatistics;
    description: string;
    icon_classes: string[]
    formatter: Intl.NumberFormat;
    help_text?: string;
}

export function formatStatistic(template: StatTemplate, statistics: ExtendedStatistics) {
    const value = statistics[template.key];
    if (value !== undefined) {
        return template.formatter.format(value);
    }
    return '';
}

const tempOptions: Intl.NumberFormatOptions = {
    style: 'unit',
    unit: 'celsius',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
}
const dayCountFormat = new Intl.NumberFormat('fr-CA', {
    maximumFractionDigits: 0
});

export const allStatTemplates: StatTemplate[] = [
    {
        key: 'target_reached_on',
        description: 'Année de dépassement du 1,5°C par rapport à 1990',
        formatter: new Intl.NumberFormat('fr-CA', { useGrouping: false }),
        icon_classes: ['bi-exclamation-triangle', 'text-danger']
    },
    {
        key: "avg_temp",
        description: 'Température moyenne',
        formatter: new Intl.NumberFormat('fr-CA', tempOptions),
        icon_classes: ['bi-thermometer-half']
    },
    {
        key: 'temp_delta',
        description: 'Variation de la température moyenne depuis 1990',
        formatter: new Intl.NumberFormat('fr-CA', {
            ...tempOptions,
            signDisplay: "always",
        }),
        icon_classes: ['bi-thermometer-high']
    },
    {
        key: 'avg_prec',
        description: 'Précipitations totales',
        formatter: new Intl.NumberFormat('fr-CA', {
            useGrouping: false,
            maximumFractionDigits: 0,
            style: 'unit',
            unit: 'millimeter'
        }),
        icon_classes: ['bi-cloud-rain']
    },
    {
        key: 'days_above_30',
        description: 'Nombres de jours au dessus de 30°C',
        formatter: dayCountFormat,
        icon_classes: ['bi-thermometer-sun']
    },
    {
        key: 'days_below_min_25',
        description: 'Nombres de jours sous -25°C',
        formatter: dayCountFormat,
        icon_classes: ['bi-thermometer-snow']
    }];
