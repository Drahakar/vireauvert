import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { DistrictProperties } from '@/models/map';
import { AdminRegion, StatSnapshot } from '@/models/regions';
import { downloadDataForYear, EMPTY_SNAPSHOT, filterCatastrophesByRegion, RegionSnapshot, YearlySnapshot } from '@/models/yearly_data';
import axios from 'axios';
import { FeatureCollection, Geometry, Position } from 'geojson';
import { defineStore } from 'pinia';
import { List, Map } from 'immutable';

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
            electoralMap: { features: [] as unknown } as FeatureCollection
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
                const region = this.allRegions.findIndex(x => x.districts.some(y => y === this.district));
                if (feature && region !== -1) {
                    return {
                        catastrophes: filterCatastrophesByRegion(data.catastrophes, feature),
                        statistics: data.statistics[region]
                    }
                } else {
                    return {
                        catastrophes: []
                    }
                }
            }
            return {
                catastrophes: data.catastrophes
            };
        }
    },
    actions: {
        async loadYearlyData() {
            const data = await downloadDataForYear(CURRENT_YEAR);
            this.yearlyData = this.yearlyData.set(CURRENT_YEAR, data);

            const queueGetData = async (year: number) => {
                setTimeout(async () => {
                    const data = await downloadDataForYear(year);
                    this.yearlyData = this.yearlyData.set(year, data);
                });
            };

            for (let year = CURRENT_YEAR - 1; year >= MIN_YEAR; --year) {
                queueGetData(year);
            }
            for (let year = CURRENT_YEAR + 1; year <= MAX_YEAR; ++year) {
                queueGetData(year);
            }
        },
        async loadAdminRegionData() {
            const response = await axios.get<AdminRegion[]>('data/admin_regions.json', { responseType: 'json' });
            this.allRegions = List(response.data);
        },
        async loadElectoralMap() {
            const response = await axios.get<FeatureCollection>('data/carte_electorale.json', { responseType: 'json' });
            this.electoralMap = response.data;
        }
    }
});