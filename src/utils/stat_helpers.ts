import { RegionStatistics } from "@/models/yearly_data";

export interface StatTemplate {
    key: keyof RegionStatistics;
    icon_classes: string[]
    format_name: string;
}

export const allStatTemplates: StatTemplate[] = [
    {
        key: 'avg_temp',
        format_name: 'temperature',
        icon_classes: ['bi-thermometer-half']
    },
    {
        key: 'temp_delta',
        format_name: 'temperature_delta',
        icon_classes: ['bi-thermometer-high']
    },
    {
        key: 'avg_prec',
        format_name: 'precipitations',
        icon_classes: ['bi-cloud-rain']
    },
    {
        key: 'days_above_30',
        format_name: 'integer',
        icon_classes: ['bi-thermometer-sun']
    },
    {
        key: 'days_below_min_25',
        format_name: 'integer',
        icon_classes: ['bi-thermometer-snow']
    }];
