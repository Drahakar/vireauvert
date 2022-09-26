import { Range } from 'immutable';

export const REFERENCE_YEAR = 1990;  // For delta temperatures
export const CURRENT_YEAR = new Date().getFullYear();

// For these years, we have historical data.
export const MIN_HISTORICAL_YEAR = REFERENCE_YEAR;
export const MAX_HISTORICAL_YEAR = 2013;
export const HISTORICAL_YEARS = Range(MIN_HISTORICAL_YEAR, MAX_HISTORICAL_YEAR + 1).toArray();

// For the next years, we have continuous prediction data.
export const MIN_PREDICTION_YEARS = MAX_HISTORICAL_YEAR + 1;
export const MAX_PREDICTION_YEARS = CURRENT_YEAR;  // only show up to today
export const PREDICTION_YEARS = Range(MIN_PREDICTION_YEARS, MAX_PREDICTION_YEARS + 1).toArray();

// NOTE: After 2035, we only have data for 2050 and 2100.
// NOTE: timeline CSS has assumptions that all modeled years end in 0.
export const MODELED_YEARS = [2030, 2050, 2100];

export const CONTINUOUS_YEARS = HISTORICAL_YEARS.concat(PREDICTION_YEARS).sort();
export const TIMELINE_YEARS = CONTINUOUS_YEARS.concat(MODELED_YEARS).sort();
