import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { kml } from '@tmcw/togeojson';
import axios from 'axios';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { defineStore } from 'pinia';
import pointInPolygon from 'point-in-polygon';

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: '',
            year: 2022,
            allCatastrophes: [] as Catastrophe[],
            electoralMap: { features: [] as unknown } as FeatureCollection<Geometry | null, GeoJsonProperties>
        };
    },
    getters: {
        catastrophesForCurrentYear: state => {
            return state.allCatastrophes.filter(x => x.date.getUTCFullYear() == state.year);
        },
        catastrophesForCurrentYearAndDistrict: state => {
            const feature = state.electoralMap.features.find(x => x.properties?.name.trim() == state.district);
            if (feature && feature.geometry?.type == "Polygon" && feature.geometry.coordinates.length > 0) {
                const coordinates = feature.geometry.coordinates[0];
                return state.allCatastrophes.filter(x => x.date.getUTCFullYear() == state.year && pointInPolygon([x.location.lng, x.location.lat], coordinates));
            }
            return state.allCatastrophes.filter(x => x.date.getUTCFullYear() == state.year);
        }
    },
    actions: {
        async updateCatastrophes() {
            const catastrophesResponse = await axios.get<CatastropheDocument[]>('data/catastrophes.json', { responseType: 'json' });
            this.allCatastrophes = catastrophesResponse.data.map(parseCatatrophe);
        },
        async loadElectoralMap() {
            const elect = await axios.get('data/carte2017simple.kml', { responseType: 'text' });
            const doc = new DOMParser().parseFromString(elect.data, 'text/xml');
            this.electoralMap = kml(doc);
        }
    }
});