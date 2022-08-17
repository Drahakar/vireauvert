import axios from 'axios';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { CatastropheType } from '@/models/catastrophes';
import { CURRENT_YEAR } from '@/models/constants';

export const useStore = defineStore('store', {
    state: () => {
        return {
            district: 0,
            year: CURRENT_YEAR,
            catastropheType: '' as (CatastropheType | ''),
            electoralMap: { features: [] as unknown } as FeatureCollection,
        };
    },
    actions: {
        async loadData() {
            const response = await axios.get<FeatureCollection>('data/carte_electorale.json', { responseType: 'json' });
            this.electoralMap = response.data;
        }
    }
});