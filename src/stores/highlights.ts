import { Highlight } from "@/models/highlights";
import axios from "axios";
import { List, Map } from "immutable";
import { defineStore } from "pinia";

export const useHighlightStore = defineStore('highlightStore', {
    state: () => {
        return {
            highlights: List<Highlight>()
        };
    },
    getters: {
        findHighlights: state => (year: number) => {
            return state.highlights.filter(x => x.year === year);
        }
    },
    actions: {
        async loadHighlights() {
            const response = await axios.get<Highlight[]>(`data/highlights.json`);
            this.highlights = List(response.data);
        }
    }
})
