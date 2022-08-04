import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { DistrictProperties } from '@/models/map';
import { AdminRegion, StatSnapshot } from '@/models/regions';
import axios from 'axios';
import { FeatureCollection, Geometry } from 'geojson';
import { defineStore } from 'pinia';
import pointInPolygon from 'point-in-polygon';

export type CatastropheDatabase = Map<string, Catastrophe[]>;

interface CatastropeResponse {
    [year: string]: CatastropheDocument[]
}

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: new Date().getFullYear(),
            allRegions: [] as AdminRegion[],
            catastrophesPerYear: new Map<string, Catastrophe[]>() as CatastropheDatabase,
            electoralMap: { features: [] as unknown } as FeatureCollection<Geometry | null, any>
        };
    },
    getters: {
        catastrophesForCurrentYear(): Catastrophe[] {
            return this.catastrophesPerYear.get(this.year.toString()) ?? [];
        },
        catastrophesForCurrentYearAndDistrict(): Catastrophe[] {
            const feature = this.district ? this.electoralMap.features.find(x => {
                const properties: DistrictProperties = x.properties;
                return properties.id === this.district;
            }) : undefined;

            let catastrophes = this.catastrophesForCurrentYear;
            if (feature?.geometry?.type === "Polygon" && feature.geometry.coordinates.length > 0) {
                const coordinates = feature.geometry.coordinates[0];
                catastrophes = catastrophes.filter(x => pointInPolygon([x.location.lng, x.location.lat], coordinates));
            }
            return catastrophes;
        },
        allDistricts(): DistrictProperties[] {
            return this.electoralMap.features.map(x => x.properties as DistrictProperties);
        },
        statisticsForCurrentYear(): Map<string, StatSnapshot> {
            return this.allRegions.reduce((result, region) => {
                const snapshot: StatSnapshot = {
                    average_temperature: region.statistics.average_temperature[this.year - 2000],
                    average_precipitations: region.statistics.average_precipitations[this.year - 2000]
                };
                for (const districtId in region.districts) {
                    result.set(districtId.toString(), snapshot);
                }
                return result;
            }, new Map<string, StatSnapshot>());
        },
        statisticsForCurrentYearAndDistrict(): StatSnapshot | null {
            if (this.district) {
                const region = this.allRegions.find(x => x.districts.includes(this.district));
                if (region) {
                    return {
                        average_temperature: region.statistics.average_temperature[this.year - 2000],
                        average_precipitations: region.statistics.average_precipitations[this.year - 2000]
                    };
                }
            }
            return null;
        }
    },
    actions: {
        async updateCatastrophes() {
            const catastrophesResponse = await axios.get<CatastropeResponse>('data/catastrophes.json', { responseType: 'json' });
            this.catastrophesPerYear = Object.keys(catastrophesResponse.data).reduce((map, year) => {
                const catastrophes = catastrophesResponse.data[year].map(parseCatatrophe);
                map.set(year, catastrophes);
                return map;
            }, new Map<string, Catastrophe[]>());
        },
        async loadElectoralMap() {
            const response = await axios.get('data/carte_electorale.json', { responseType: 'json' });
            this.electoralMap = response.data;
        },
        async loadRegions() {
            const regionResponse = await axios.get<AdminRegion[]>('data/admin_regions.json', { responseType: 'json' });
            const regions = regionResponse.data;

            const [temp, prec] = await Promise.all([
                axios.get<(number | null)[][]>('data/temperatures_moy_regions.json', { responseType: 'json' }),
                axios.get<(number | null)[][]>('data/precipitations_moy_regions.json', { responseType: 'json' })
            ]);
            for (let i = 0; i < regions.length; ++i) {
                regions[i].statistics = {
                    average_temperature: temp.data[i],
                    average_precipitations: prec.data[i]
                }
            }

            this.allRegions = regions;
        }
    }
});