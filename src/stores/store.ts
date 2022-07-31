import { Catastrophe, CatastropheDocument, parseCatatrophe } from '@/models/catastrophes';
import { kml } from '@tmcw/togeojson';
import axios from 'axios';
import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
    state: () => {
        return {
            region: '',
            year: 2022,
            allCatastrophes: [] as Catastrophe[],
            electoralMap: {} as any
        };
    },
    getters: {
        catastrophesForCurrentYear: state => {
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