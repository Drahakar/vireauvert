import { ICatastrophes } from '@/models/catastrophes';
import axios from 'axios';
import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
    state: () => {
        return {
            region: '',
            year: 2022,
            allCatastrophes: {} as ICatastrophes
        };
    },
    getters: {
        catastrophesForCurrentRegion: state => {
            return state.region && state.allCatastrophes[state.region] || [];
        }
    },
    actions: {
        async updateCatastrophes() {
            const catastrophesResponse = await axios.get<ICatastrophes>('data/catastrophes-naturelles.json', { responseType: 'json' });
            this.allCatastrophes = catastrophesResponse.data;
        }
    }
});