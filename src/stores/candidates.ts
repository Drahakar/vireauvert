import { Candidate } from "@/models/candidates";
import axios from "axios";
import { List } from "immutable";
import { defineStore } from "pinia";

export const useCandidateStore = defineStore('candidateStore', {
    state: () => {
        return {
            candidates: List<Candidate>()
        }
    },
    getters: {
        candidatesByDistrict: state => (id: number) => {
            return state.candidates.filter(x => x.district === id);
        }
    },
    actions: {
        async loadCandidates() {
            const response = await axios.get<Candidate[]>('data/candidates.json');
            this.candidates = List(response.data);
        }
    }
});