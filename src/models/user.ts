import { CatastropheFilter } from "./catastrophes";
import { CURRENT_YEAR } from "./constants";

export interface UserFilter {
    district: number;
    year: number;
    catastrophe: CatastropheFilter;
}

export const DEFAULT_FILTER: UserFilter = {
    district: 0,
    year: CURRENT_YEAR,
    catastrophe: ''
};