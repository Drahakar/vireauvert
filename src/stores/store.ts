import { DistrictProperties } from '@/models/map';
import { AdminRegion } from '@/models/regions';
import { downloadDataForYear, filterCatastrophesByRegion, RegionSnapshot, YearlySnapshot } from '@/models/yearly_data';
import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { List, Map } from 'immutable';
import { Candidate } from '@/models/candidates';

export const MIN_CONTINUOUS_YEAR = 2000;
export const MAX_CONTINUOUS_YEAR = 2035;
export const PAST_REFERENCE_YEAR = 1990;
export const FUTURE_SCENARIO_YEAR1 = 2050;
export const FUTURE_SCENARIO_YEAR2 = 2100;
export const TIMELINE_YEARS = [...Array(((MAX_CONTINUOUS_YEAR - MIN_CONTINUOUS_YEAR)) + 1).keys()].map(x => MIN_CONTINUOUS_YEAR + x ).concat(PAST_REFERENCE_YEAR, FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2).sort();
export const CURRENT_YEAR = new Date().getFullYear();

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: CURRENT_YEAR,
            allRegions: List<AdminRegion>(),
            yearlyData: Map<number, YearlySnapshot>(),
            electoralMap: { features: [] as unknown } as FeatureCollection,
            candidates: List<Candidate>(),
            temperatureTargetPerRegion: Map<number, number>()
        };
    },
    getters: {
        allDistricts(): DistrictProperties[] {
            return this.electoralMap.features.map(x => x.properties as DistrictProperties).sort((a, b) => collator.compare(a.name, b.name));
        },
        selectedData(): RegionSnapshot {
            const data = this.yearlyData.get(this.year);
            if (!data) {
                return {
                    catastrophes: List(),
                    candidates: List()
                }
            }

            if (this.district) {
                const feature = this.electoralMap.features.find(x => {
                    const properties = x.properties as DistrictProperties;
                    return properties.id === this.district;
                });
                const region = this.getRegion(this.district);
                const snapshot: RegionSnapshot = {
                    catastrophes: filterCatastrophesByRegion(data.catastrophes, feature),
                    info: region ? data.regions.get(region.id) : undefined,
                    candidates: List(this.candidates.filter(x => x.district == this.district)),
                    targetReachedOn: region ? this.temperatureTargetPerRegion.get(region.id) : undefined
                }
                return snapshot;
            } else {
                return {
                    catastrophes: data.catastrophes,
                    info: data.regions.get(0),
                    candidates: List(),
                    targetReachedOn: this.temperatureTargetPerRegion.get(0)
                };
            }
        },
        getRegion: state => (district_id: number) => state.allRegions.find(x => x.districts.some(y => y === district_id))
    },
    actions: {
        async loadData() {
            const download = async <T>(file: string) => {
                const response = await axios.get<T>(`data/${file}`, { responseType: 'json' });
                return response.data;
            };

            this.allRegions = List(await download<AdminRegion[]>('admin_regions.json'));
            this.electoralMap = await download<FeatureCollection>('carte_electorale.json');
            this.candidates = List(await download<Candidate[]>('candidates.json'));

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