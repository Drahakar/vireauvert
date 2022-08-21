import { Catastrophe, CatastropheType, Severity } from "@/models/catastrophes";
import { IntlDateTimeFormats, IntlNumberFormats, useI18n } from "vue-i18n";

function isCatastropheFeminine(type: CatastropheType) {
    return type === CatastropheType.Flood || type === CatastropheType.Tornado || type === CatastropheType.FreezingRain;
}

export const messages = {
    // General translations
    all: "Toute | Toutes",
    at: "à",
    in: "en",

    // Catastrophes

    catastrophes: "Événement extrême | Événements extrêmes",
    catastrophe_FLOOD: "Inondation | Inondations",
    catastrophe_FOREST_FIRE: "Feu de forêt | Feux de forêt",
    catastrophe_VIOLENT_STORM: "Orage violent | Orages violents",
    catastrophe_TORNADO: "Tornade | Tornades",
    catastrophe_FREEZING_RAIN: "Pluie verglaçante | Pluies verglaçantes",
    catastrophe_WINTER_STORM: "Tempête hivernale | Tempêtes hivernales",
    catastrophe_STORM_WINDS: "Vent de tempête | Vents de tempête",

    // dirty hack: use pluralisation support for genders instead
    severity_4: "extrême | extrême",
    severity_3: "important | importante",
    severity_2: "modéré | modérée",
    severity_1: "mineur | mineure",
    severity_0: "inconnu | inconnue",

    catastrophe_with_severity: ({ linked, named }: any) => {
        const catastrophe: Catastrophe = named('catastrophe');

        const translatedType = linked(`catastrophe_${catastrophe.type}`);
        let translatedSeverity = linked(`severity_${catastrophe.severity}`);
        if (isCatastropheFeminine(catastrophe.type) && catastrophe.severity !== Severity.Extreme) {
            translatedSeverity += 'e';
        }
        return `${translatedType} ${translatedSeverity}`;
    },

    // Parties and candidates

    party_leaders: "Chefs de parti",
    candidates: "Candidat(e)s",

    party_CAQ: "Coalition Avenir Québec",
    party_CQ: "Climat Québec",
    party_PCQ: "Parti Conservateur du Québec",
    party_PLQ: "Parti Libéral du Québec",
    party_PQ: "Parti Québécois",
    party_PV: "Parti Vert du Québec",
    party_QS: "Québec Solidaire",

    party_acro_CAQ: "CAQ",
    party_acro_CQ: "CQ",
    party_acro_PCQ: "PCQ",
    party_acro_PLQ: "PLQ",
    party_acro_PQ: "PQ",
    party_acro_PV: "PVQ",
    party_acro_QS: "QS",

    call_to_action: "Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales",

    // Statistics

    statistics: "Statistiques",

    statistic_target_reached_on: "Année de dépassement du 1,5°C par rapport à 1990",
    statistic_temp_delta: "Variation de la température moyenne depuis 1990",
    statistic_avg_temp: "Température moyenne",
    statistic_avg_prec: "Précipitations totales",
    statistic_days_above_30: "Nombres de jours au dessus de 30°C",
    statistic_days_below_min_25: "Nombres de jours sous -25°C",

    statistic_help_target_reached_on: "",
    statistic_help_temp_delta: "",
    statistic_help_avg_temp: "",
    statistic_help_avg_prec: "",
    statistic_help_days_above_30: "",
    statistic_help_days_below_min_25: "",

    // Districts and regions
    no_district_search_results: "Désolé, aucune circonscription trouvée avec ce nom.",
    province_of_quebec: "Province de Québec",

    // Timeline
    research_year: "Année de recherche",
};

export const numberFormats = {
    temperature: {
        style: 'unit',
        unit: 'celsius',
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
        month: 'long'
    }
} as IntlDateTimeFormats;