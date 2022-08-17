import axios, { AxiosError } from "axios";
import { Map } from "immutable";
import { defineStore } from "pinia";
import * as Sentry from "@sentry/vue";
import { TIMELINE_YEARS } from "@/models/constants";
import { parseYearlyStatistics, RegionStatistics, YearlyStatistics, YearlyStatisticsDocument } from "@/models/yearly_data";
import { findRegionByDistrict } from "@/models/regions";

export const useStatisticStore = defineStore('statisticStore', {
    state: () => {
        return {
            statistics: Map<number, YearlyStatistics>(),
            temperatureTargetPerRegion: Map<number, number>()
        };
    },
    getters: {
        findStatistics: state => (year: number, district: number): RegionStatistics => {
            const byYear = state.statistics.get(year);
            if (byYear) {
                let statistics = byYear.get(district); // first off, search by district
                if (statistics === undefined) {
                    const region = findRegionByDistrict(district); // no stats for district, fall back to searching by region
                    if (region) {
                        statistics = byYear.get(region.id);
                    }
                }
                return statistics ?? {};
            }
            return {};
        },
        getYearOverTarget: state => (district: number): number | undefined => {
            let year = state.temperatureTargetPerRegion.get(district);
            if (year === undefined) {
                const region = findRegionByDistrict(district);
                if (region) {
                    year = state.temperatureTargetPerRegion.get(region.id);
                }
            }
            return year;
        }
    },
    actions: {
        async loadStatistics() {
            for (const year of TIMELINE_YEARS) {
                try {
                    const response = await axios.get<YearlyStatisticsDocument>(`data/statistics/${year}.json`);
                    const statistics = parseYearlyStatistics(response.data);
                    this.statistics = this.statistics.set(year, statistics);
                }
                catch (err) {
                    if (!(err instanceof AxiosError) || !err.response || err.response.status !== 404) {
                        Sentry.captureException(err);
                    }
                }
            }
            {
                const response = await axios.get<Record<string, number>>(`data/statistics/over_limit.json`);
                this.temperatureTargetPerRegion = Map(Object.entries(response.data).map(([k, v]) => [parseInt(k), v]));
            }
        }
    }
})