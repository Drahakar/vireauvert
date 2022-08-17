import axios, { AxiosError } from "axios";
import { List, Map } from "immutable";
import { Catastrophe, CatastropheType } from "./catastrophes";
import * as Sentry from "@sentry/vue";

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

export async function downloadDataForYear(year: number, refYear?: YearlyStatistics): Promise<YearlyStatistics> {
    try {
        const response = await axios.get<YearlyStatisticsDocument>(`data/yearly_data/${year}.json`);
        const data = response.data;
        const snapshot: YearlyStatistics = {
            year,
            regions: Map(Object.entries(data.statistics).map(([k, v]) => {
                const regionId = parseInt(k);
                const refTemp = refYear?.regions.get(regionId)?.avg_temp;
                const info: RegionInfo = {
                    ...v,
                    temp_increase: v.avg_temp && refTemp ? v.avg_temp - refTemp : 0
                };
                return [regionId, info];
            }))
        };
        return snapshot;
    }
    catch (err) {
        if (!(err instanceof AxiosError) || !err.response || err.response.status !== 404) {
            // If we got something other than a 404, send it to Sentry
            Sentry.captureException(err);
        }
        return {
            year: year,
            regions: Map()
        }
    }
}

export function filterCatastrophesByRegion(catastropes: List<Catastrophe>, district: number, type: CatastropheType | ''): List<Catastrophe> {
    if (district === 0 && type === '') {
        return catastropes;
    }

    return catastropes.filter(x => {
        if (type && x.type !== type) {
            return false;
        }
        if (district === 0) {
            return true;
        }
        return district === x.district;
    });
}
