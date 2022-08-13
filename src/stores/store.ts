import { DistrictProperties } from '@/models/map';
import { AdminRegion } from '@/models/regions';
import { downloadDataForYear, filterCatastrophesByRegion, RegionSnapshot, YearlySnapshot } from '@/models/yearly_data';
import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { List, Map } from 'immutable';
import { Candidate } from '@/models/candidates';

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2035;
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
            }
            return {
                catastrophes: data.catastrophes,
                candidates: List()
            };
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

            const promises = [];
            for (let year = CURRENT_YEAR - 1; year >= MIN_YEAR; --year) {
                promises.push(addData(year));
            }
            for (let year = CURRENT_YEAR + 1; year <= MAX_YEAR; ++year) {
                promises.push(addData(year));
            }
            await Promise.all(promises);

            let targetReached = Map<number, number>();
            for (let year = MIN_YEAR; year <= MAX_YEAR; ++year) {
                const data = this.yearlyData.get(year);
                if (data) {
                    for (const [regionId, info] of data.regions) {
                        if (targetReached.contains(regionId)) {
                            continue;
                        }
                        if (info.temp_increase >= 1.5) {
                            targetReached = targetReached.set(regionId, year);
                        }
                    }
                }
            }
            this.temperatureTargetPerRegion = targetReached;
        }
    }
});