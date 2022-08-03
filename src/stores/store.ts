import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { DistrictProperties } from '@/models/map';
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
        }
    }
});