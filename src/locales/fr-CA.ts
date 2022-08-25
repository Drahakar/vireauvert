import { Catastrophe, CatastropheType, Severity } from "@/models/catastrophes";
import { MessageContext } from "@intlify/core-base";

function isCatastropheFeminine(type: CatastropheType) {
    return type === CatastropheType.Flood || type === CatastropheType.Tornado || type === CatastropheType.FreezingRain;
}

export default {
    // General translations
    all: "Toute | Toutes",
    in_year: "en {year}",
    at_location: "à {location}",
    count_by_year: "{count} en {year}",

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

    catastrophe_with_severity: ({ linked, named }: MessageContext) => {
        const catastrophe = named('catastrophe') as Catastrophe;

        const translatedType = linked(`catastrophe_${catastrophe.type}`);
        let translatedSeverity = linked(`severity_${catastrophe.severity}`);
        if (isCatastropheFeminine(catastrophe.type) && catastrophe.severity !== Severity.Extreme) {
            translatedSeverity += 'e';
        }

        let result = `${translatedType} ${translatedSeverity}`;
        if (named('show_city') && catastrophe.city) {
            result += ` à ${catastrophe.city}`;
        }
        return result;
    },

    no_future_catastrophes: "Les évênements extrêmes ne sont disponibles que pour les années passées",

    // Parties and candidates

    party_leaders: "Chef(fe)s de parti",
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

    facebook: "Page Facebook",
    call_to_action: "Écrivez à vos candidat(e)s pour leur faire part de vos préoccupations environnementales",

    // Statistics

    statistics: "Statistiques",

    statistic_target_reached_on: "Cible de 1,5°C dépassée pour la première fois en {0}",
    statistic_temp_delta: "Variation de la température depuis 1990",
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