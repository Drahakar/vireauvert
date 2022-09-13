export const REFERENCE_YEAR = 1990;  // For delta temperatures
export const MIN_CONTINUOUS_YEAR = REFERENCE_YEAR;
export const MAX_CONTINUOUS_YEAR = 2035;
export const FUTURE_SCENARIO_YEAR1 = 2050;
export const FUTURE_SCENARIO_YEAR2 = 2100;
export const TIMELINE_YEARS = [...Array(((MAX_CONTINUOUS_YEAR - MIN_CONTINUOUS_YEAR)) + 1).keys()].map(x => MIN_CONTINUOUS_YEAR + x ).concat(FUTURE_SCENARIO_YEAR1, FUTURE_SCENARIO_YEAR2).sort();
export const CURRENT_YEAR = new Date().getFullYear();
export const BEGIN_MODELED_YEAR = 2014;
