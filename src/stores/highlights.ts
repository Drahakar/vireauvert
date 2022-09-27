import { Highlight } from "@/models/highlights";
import axios from "axios";
import { List } from "immutable";
import { defineStore } from "pinia";

export const useHighlightStore = defineStore('highlightStore', {
    state: () => {
        return {
            highlights: List<Highlight>()
        };
    },
    getters: {
        findHighlights: state => (year: number, locale: string) => {
            return state.highlights.filter(x => x.year === year && locale === locale);
        },
        getYearsWithHighlights: state => (locale: string) => {
            return state.highlights.filter(x => x.locale === locale).map(x => x.year).toSet();
        }
    },
    actions: {
        async loadHighlights() {
            const response = await axios.get<Highlight[]>(`data/highlights.json`);
            this.highlights = List(response.data);
        }
    }
})
