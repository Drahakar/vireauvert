import { List, Map } from "immutable";
import { Catastrophe, CatastropheType } from "./catastrophes";

export type YearlyStatistics = Map<number, RegionStatistics>;
export const EMPTY_STATISTICS: YearlyStatistics = Map();

export interface RegionStatistics {
    temp_delta?: number;
    avg_temp?: number;
    avg_prec?: number;
    days_above_30?: number;
    days_below_min_25?: number;
}

export interface YearlyStatisticsDocument {
    [id: string]: RegionStatistics
}

export function parseYearlyStatistics(doc: YearlyStatisticsDocument): YearlyStatistics {
    return Map(Object.entries(doc).map(([region, stats]) => [parseInt(region), stats]));
}

export function filterCatastrophesByRegion(catastropes: List<Catastrophe>, district: number, type: CatastropheType | ''): List<Catastrophe> {
    if (district === 0 && type === '') {
        return catastropes;
    }

    return catastropes.filter(x => {
        if (type && x.type !== type) {
            return false;
        }
        return district === 0 || district === x.district;
    });
}
