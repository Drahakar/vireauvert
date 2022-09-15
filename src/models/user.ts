import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from "./catastrophes";
import { CURRENT_YEAR } from "./constants";

export interface UserState {
    district: number;
    year: number;
    catastropheFilter: CatastropheFilter;
    location: [number, number];
    zoom: number;
}

export const DEFAULT_USER_STATE: UserState = {
    district: 0,
    year: CURRENT_YEAR,
    catastropheFilter: FILTER_ALL_CATASTROPHES,
    location: [45.5001, -73.5679],
    zoom: 0
};
