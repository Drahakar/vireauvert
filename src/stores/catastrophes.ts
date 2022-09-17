import { Catastrophe, CatastropheDocument, CatastropheFilter, parseCatatrophe } from "@/models/catastrophes";
import axios from "axios";
import { List, Map } from "immutable";
import { defineStore } from "pinia";

function filterCatastrophe(catastrophe: Catastrophe, district: number, filter: CatastropheFilter) {
    if (district && catastrophe.district !== district) {
        return false;
    }
    if (!filter.includes(catastrophe.type)) {
        return false;
    }
    return true;
}

export const useCatastropheStore = defineStore('catastropheStore', {
    state: () => {
        return {
            catastrophes: Map<number, List<Catastrophe>>()
        };
    },
    getters: {
        findCatastrophes: state => (year: number, district: number, filter: CatastropheFilter): List<Catastrophe> => {
            const catastrophes = state.catastrophes.get(year);
            if (catastrophes) {
                return catastrophes.filter(x => filterCatastrophe(x, district, filter));
            }
            return List();
        },
        countCatastrophes: state => (year: number, district: number, filter: CatastropheFilter): number => {
            const catastrophes = state.catastrophes.get(year);
            if (catastrophes) {
                return catastrophes.count(x => filterCatastrophe(x, district, filter));
            }
            return 0;
        },
    },
    actions: {
        async loadCatastrophes() {
            const response = await axios.get<{ [year: string]: CatastropheDocument[] }>(`data/catastrophes.json`);
            for (const [year, docs] of Object.entries(response.data)) {
                const catastrophes = docs.map(parseCatatrophe);
                this.catastrophes = this.catastrophes.set(parseInt(year, 10), List(catastrophes));
            }
        }
    }
})
