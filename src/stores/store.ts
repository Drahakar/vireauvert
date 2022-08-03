import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { DistrictProperties } from '@/models/map';
import axios from 'axios';
import { FeatureCollection, Geometry } from 'geojson';
import { defineStore } from 'pinia';
import pointInPolygon from 'point-in-polygon';

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: 2022,
            allCatastrophes: [] as Catastrophe[],
            electoralMap: { features: [] as unknown } as FeatureCollection<Geometry | null, any>
        };
    },
    getters: {
        catastrophesForCurrentYear: state => {
            return state.allCatastrophes.filter(x => x.date.getUTCFullYear() == state.year);
        },
        catastrophesForCurrentYearAndDistrict: state => {
            const feature = state.district ? state.electoralMap.features.find(x => {
                const properties: DistrictProperties = x.properties;
                return properties.id === state.district;
            }) : undefined;
            
            let catastrophes = state.allCatastrophes.filter(x => x.date.getUTCFullYear() == state.year);
            
            if (feature && feature.geometry?.type == "Polygon" && feature.geometry.coordinates.length > 0) {
                const coordinates = feature.geometry.coordinates[0];
                catastrophes = catastrophes.filter(x => pointInPolygon([x.location.lng, x.location.lat], coordinates));
            }

            catastrophes.sort((a, b) => a.date.getTime() - b.date.getTime());
            return catastrophes;
        },
        allDistricts: state => {
            return state.electoralMap.features.map(x => {
                const properties: DistrictProperties = x.properties;
                return properties;
            });
        }
    },
    actions: {
        async updateCatastrophes() {
            const catastrophesResponse = await axios.get<CatastropheDocument[]>('data/catastrophes.json', { responseType: 'json' });
            this.allCatastrophes = catastrophesResponse.data.map(parseCatatrophe);
        },
        async loadElectoralMap() {
            const response = await axios.get('data/carte_electorale.json', { responseType: 'json' });
            this.electoralMap = response.data;
        }
    }
});