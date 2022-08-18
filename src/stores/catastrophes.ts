import { Catastrophe, CatastropheDocument, parseCatatrophe } from "@/models/catastrophes";
import axios, { AxiosError } from "axios";
import { List, Map } from "immutable";
import { defineStore } from "pinia";
import * as Sentry from "@sentry/vue";
import { CURRENT_YEAR, MIN_CONTINUOUS_YEAR } from "@/models/constants";

export const useCatastropheStore = defineStore('catastropheStore', {
    state: () => {
        return {
            catastrophes: Map<number, List<Catastrophe>>()
        };
    },
    getters: {
        findCatastrophes: state => (year: number, district = 0) => {
            let catastrophes = state.catastrophes.get(year) ?? List();
            if (district) {
                catastrophes = catastrophes.filter(x => x.district === district);
            }
            return catastrophes;
        }
    },
    actions: {
        async loadCatastrophes() {
            for (let year = MIN_CONTINUOUS_YEAR; year <= CURRENT_YEAR; ++year) {
                try {
                    const response = await axios.get<CatastropheDocument[]>(`data/catastrophes/${year}.json`);
                    const catastrophes = response.data.map(parseCatatrophe);
                    this.catastrophes = this.catastrophes.set(year, List(catastrophes));
                }
                catch (err) {
                    if (!(err instanceof AxiosError) || !err.response || err.response.status !== 404) {
                        Sentry.captureException(err);
                    }
                }
            }
        }
    }
})