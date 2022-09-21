import { FILTER_ALL_CATASTROPHES, CatastropheFilter } from "./catastrophes";
import { CURRENT_YEAR } from "./constants";

export const MIN_ZOOM = 5;
export const MAX_ZOOM = 15;
export const DEFAULT_ZOOM = 7;

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
    location: [46.6908995, -70.9936523],
    zoom: DEFAULT_ZOOM
};