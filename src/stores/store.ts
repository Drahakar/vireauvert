import { DistrictProperties } from '@/models/map';
import { AdminRegion } from '@/models/regions';
import { downloadDataForYear, EMPTY_SNAPSHOT, filterCatastrophesByRegion, RegionSnapshot, YearlySnapshot } from '@/models/yearly_data';
import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { List, Map } from 'immutable';
import { Candidate } from '@/models/candidates';

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2035;
export const CURRENT_YEAR = new Date().getFullYear();

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: CURRENT_YEAR,
            allRegions: List<AdminRegion>(),
            yearlyData: Map<number, YearlySnapshot>(),
            electoralMap: { features: [] as unknown } as FeatureCollection,
            candidates: [] as Candidate[]
        };
    },
    getters: {
        allDistricts(): DistrictProperties[] {
            return this.electoralMap.features.map(x => x.properties as DistrictProperties);
        },
        selectedData(): RegionSnapshot {
            const data = this.yearlyData.get(this.year, EMPTY_SNAPSHOT);
            if (this.district) {
                const feature = this.electoralMap.features.find(x => {
                    const properties = x.properties as DistrictProperties;
                    return properties.id === this.district;
                });
                const region = this.allRegions.find(x => x.districts.some(y => y === this.district));
                return {
                    catastrophes: filterCatastrophesByRegion(data.catastrophes, feature),
                    statistics: region ? data.statistics.get(region.id) : undefined,
                    candidates: List(this.candidates.filter(x => x.district == this.district))
                }
            }
            return {
                catastrophes: data.catastrophes,
                candidates: List()
            };
        }
    },
    actions: {
        async loadYearlyData() {
            const data = await downloadDataForYear(CURRENT_YEAR);
            this.yearlyData = this.yearlyData.set(CURRENT_YEAR, data);

            const queueGetData = async (year: number) => {
                const data = await downloadDataForYear(year);
                this.yearlyData = this.yearlyData.set(year, data);
            };

            const promises = [];
            for (let year = CURRENT_YEAR - 1; year >= MIN_YEAR; --year) {
                promises.push(queueGetData(year));
            }
            for (let year = CURRENT_YEAR + 1; year <= MAX_YEAR; ++year) {
                promises.push(queueGetData(year));
            }
            await Promise.all(promises);

        },
        async loadAdminRegionData() {
            const response = await axios.get<AdminRegion[]>('data/admin_regions.json', { responseType: 'json' });
            this.allRegions = List(response.data);
        },
        async loadElectoralMap() {
            const response = await axios.get<FeatureCollection>('data/carte_electorale.json', { responseType: 'json' });
            this.electoralMap = response.data;
        },
        async loadCandidates() {
            const response = await axios.get<Candidate[]>('data/candidates.json', { responseType: 'json' });
            this.candidates = response.data;
        }
    }
});