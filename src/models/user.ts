import { CatastropheFilter } from "./catastrophes";
import { CURRENT_YEAR } from "./constants";

export interface UserState {
    district: number;
    year: number;
    catastrophe: CatastropheFilter;
}

export const DEFAULT_USER_STATE: UserState = {
    district: 0,
    year: CURRENT_YEAR,
    catastrophe: ''
};