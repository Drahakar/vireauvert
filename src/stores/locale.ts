import { defineStore } from "pinia";

export const useLocaleStore = defineStore('Locale', {
    state: () => {
        return {
            locale: 'fr-CA'
        };
    },
    getters: {
        getNumberFormat: state => (options?: Intl.NumberFormatOptions) => {
            return new Intl.NumberFormat(state.locale, options);
        },
        getDateTimeFormat: state => (options?: Intl.DateTimeFormatOptions) => {
            return new Intl.DateTimeFormat(state.locale, options);
        }
    }
});