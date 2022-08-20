import axios from "axios";
import { Map } from "immutable";
import { defineStore } from "pinia";
import { parseYearlyStatistics, RegionStatistics, YearlyStatistics, YearlyStatisticsDocument } from "@/models/yearly_data";
import { findRegionByDistrict } from "@/models/regions";

export const useStatisticStore = defineStore('statisticStore', {
    state: () => {
        return {
            statistics: Map<number, YearlyStatistics>(),
            temperatureTargetYearPerRegion: Map<number, number>()
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
            let year = state.temperatureTargetYearPerRegion.get(district);
            if (year === undefined) {
                const region = findRegionByDistrict(district);
                if (region) {
                    year = state.temperatureTargetYearPerRegion.get(region.id);
                }
            }
            return year;
        }
    },
    actions: {
        async loadStatistics() {
            const response = await axios.get<{
                statistics: { [year: string]: YearlyStatisticsDocument },
                over_target: { [id: string]: number }
            }>(`data/statistics.json`);

            for (const [year, doc] of Object.entries(response.data.statistics)) {
                const statistics = parseYearlyStatistics(doc);
                this.statistics = this.statistics.set(parseInt(year, 10), statistics);
            }
            this.temperatureTargetYearPerRegion = Map(Object.entries(response.data.over_target).map(([k, v]) => [parseInt(k), v]));
        }
    }
})