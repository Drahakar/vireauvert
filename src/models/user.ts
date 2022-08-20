import { CatastropheFilter } from "./catastrophes";
import { CURRENT_YEAR } from "./constants";

export interface UserState {
    district: number;
    year: number;
    catastrophe: CatastropheFilter;
    location: [number, number];
    zoom: number;
}

export const DEFAULT_USER_STATE: UserState = {
    district: 0,
    year: CURRENT_YEAR,
    catastrophe: '',
    location: [45.5001, -73.5679],
    zoom: 11
};