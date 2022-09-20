import { Range } from 'immutable';

export const REFERENCE_YEAR = 1990;  // For delta temperatures
export const MIN_CONTINUOUS_YEAR = REFERENCE_YEAR;
export const MAX_CONTINUOUS_YEAR = 2022;
export const CONTINUOUS_YEARS = Range(MIN_CONTINUOUS_YEAR, MAX_CONTINUOUS_YEAR + 1).toArray();

// NOTE: Past 2035, we only have data for 2050 and 2100.
export const MODELED_YEARS = [2025, 2030, 2035, 2050, 2100];

export const TIMELINE_YEARS = CONTINUOUS_YEARS.concat(MODELED_YEARS).sort();
export const CURRENT_YEAR = new Date().getFullYear();
