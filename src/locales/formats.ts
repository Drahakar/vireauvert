import { IntlDateTimeFormats, IntlNumberFormats } from "vue-i18n";

export const numberFormats = {
    temperature: {
        style: 'unit',
        unit: 'celsius',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    },
    temperature_delta_no_unit: {
        signDisplay: 'exceptZero',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    },
    temperature_delta: {
        style: 'unit',
        unit: 'celsius',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: 'exceptZero'
    },
    temperature_delta_int: {
        style: 'unit',
        unit: 'celsius',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        signDisplay: 'exceptZero'
    },
    precipitations: {
        useGrouping: false,
        maximumFractionDigits: 0,
        style: 'unit',
        unit: 'millimeter'
    },
    integer: {
        useGrouping: false,
        maximumFractionDigits: 0,
    },
    compact_delta: {
        signDisplay: 'exceptZero'
    }
} as IntlNumberFormats;

export const datetimeFormats = {
    event_date: {
        day: '2-digit',
        month: 'long',
        timeZone: 'UTC'
    },    
    event_date_short: {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC'
    }
} as IntlDateTimeFormats;
