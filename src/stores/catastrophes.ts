import { Catastrophe, CatastropheDocument, CatastropheFilter, parseCatatrophe } from "@/models/catastrophes";
import axios from "axios";
import { List, Map } from "immutable";
import { defineStore } from "pinia";

export const useCatastropheStore = defineStore('catastropheStore', {
    state: () => {
        return {
            catastrophes: Map<number, List<Catastrophe>>()
        };
    },
    getters: {
        findCatastrophes: state => (year: number, district = 0, filter: CatastropheFilter) => {
            let catastrophes = state.catastrophes.get(year) ?? List();
            if (district) {
                catastrophes = catastrophes.filter(x => x.district === district);
            }
            catastrophes = catastrophes.filter(x => filter.includes(x.type));
            return catastrophes;
        }
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
