import { findRegionByDistrict } from '@/models/regions';
import { downloadDataForYear, filterCatastrophesByRegion, RegionSnapshot, YearlySnapshot } from '@/models/yearly_data';
import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { List, Map } from 'immutable';
import { CatastropheType } from '@/models/catastrophes';
import { CURRENT_YEAR, TIMELINE_YEARS } from '@/models/constants';

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: CURRENT_YEAR,
            catastropheType: '' as (CatastropheType | ''),
            yearlyData: Map<number, YearlySnapshot>(),
            electoralMap: { features: [] as unknown } as FeatureCollection,
            temperatureTargetPerRegion: Map<number, number>()
        };
    },
    getters: {
        selectedData(): RegionSnapshot {
            const data = this.yearlyData.get(this.year);
            if (!data) {
                return {}
            }

            const region = findRegionByDistrict(this.district);
            const snapshot: RegionSnapshot = {
                info: region ? data.regions.get(region.id) : undefined,
                targetReachedOn: region ? this.temperatureTargetPerRegion.get(region.id) : undefined
            }
            return snapshot;
        }
    },
    actions: {
        async loadData() {
            const download = async <T>(file: string) => {
                const response = await axios.get<T>(`data/${file}`, { responseType: 'json' });
                return response.data;
            };

            this.electoralMap = await download<FeatureCollection>('carte_electorale.json');

            const refYear = await downloadDataForYear(1990);

            const addData = async (year: number) => {
                const data = await downloadDataForYear(year, refYear);
                this.yearlyData = this.yearlyData.set(year, data);
            };

            await addData(CURRENT_YEAR);

            const promises: Promise<void>[] = [];
            TIMELINE_YEARS.forEach(year => {
                promises.push(addData(year));
            });

            await Promise.all(promises);

            let targetReached = Map<number, number>();
            TIMELINE_YEARS.forEach(year => {
                const data = this.yearlyData.get(year);
                if (data) {
                    for (const [regionId, info] of data.regions) {
                        if (!targetReached.has(regionId) && info.temp_increase >= 1.5) {
                            targetReached = targetReached.set(regionId, year);
                        }
                    }
                }
            });
            this.temperatureTargetPerRegion = targetReached;
        }
    }
});