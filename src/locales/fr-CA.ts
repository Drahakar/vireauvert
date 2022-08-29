import { Catastrophe, CatastropheGroup, CatastropheType, Severity } from "@/models/catastrophes";
import { MessageContext } from "@intlify/core-base";

function isCatastropheFeminine(type: CatastropheType) {
    return type === CatastropheType.Flood || type === CatastropheType.Tornado || type === CatastropheType.FreezingRain;
}

const catastrophes = {
    FLOOD: ["Inondation", "Inondations"],
    FOREST_FIRE: ["Feu de forêt", "Feux de forêt"],
    VIOLENT_STORM: ["Orage violent", "Orages violents"],
    TORNADO: ["Tornade", "Tornades"],
    FREEZING_RAIN: ["Pluie verglaçante", "Pluies verglaçantes"],
    WINTER_STORM: ["Tempête hivernale", "Tempêtes hivernales"],
    STORM_WINDS: ["Vent de tempête", "Vents de tempête"]
};

function translateSeverity(severity: Severity, feminine: boolean, plural = false) {
    let result = "inconnu";
    switch (severity) {
        case Severity.Extreme:
            result = "extrême";
            break;
        case Severity.Important:
            result = "important";
            break;
        case Severity.Moderate:
            result = "modéré";
            break;
        case Severity.Minor:
            result = "mineur";
            break;
    };
    if (feminine && !result.endsWith('e')) {
        result += 'e';
    }
    if(plural && !result.endsWith('s')) {
        result += 's';
    }
    return result;
}

export default {
    // General translations
    all: "Toute | Toutes",
    in_year: "en {year}",
    at_location: "à {location}",
    count_by_year: "{count} en {year}",

    // Catastrophes

    catastrophes: "Événement extrême | Événements extrêmes",
    catastrophe_FLOOD: ({ plural }: MessageContext) => plural(catastrophes.FLOOD),
    catastrophe_FOREST_FIRE: ({ plural }: MessageContext) => plural(catastrophes.FOREST_FIRE),
    catastrophe_VIOLENT_STORM: ({ plural }: MessageContext) => plural(catastrophes.FREEZING_RAIN),
    catastrophe_TORNADO: ({ plural }: MessageContext) => plural(catastrophes.TORNADO),
    catastrophe_FREEZING_RAIN: ({ plural }: MessageContext) => plural(catastrophes.FREEZING_RAIN),
    catastrophe_WINTER_STORM: ({ plural }: MessageContext) => plural(catastrophes.WINTER_STORM),
    catastrophe_STORM_WINDS: ({ plural }: MessageContext) => plural(catastrophes.STORM_WINDS),

    // dirty hack: use pluralisation support for genders instead
    severity_4: "extrême",
    severity_3: "important",
    severity_2: "modéré",
    severity_1: "mineur",
    severity_0: "inconnu",

    catastrophe_with_severity: ({ linked, named }: MessageContext) => {
        const catastrophe = named('catastrophe') as Catastrophe;

        const translatedType = linked(`catastrophe_${catastrophe.type}`);
        const translatedSeverity = translateSeverity(catastrophe.severity, isCatastropheFeminine(catastrophe.type));

        let result = `${translatedType} ${translatedSeverity}`;
        if (named('show_city') && catastrophe.city) {
            if (catastrophe.loc_approx) {
                result += ' près de ';
            } else {
                result += ' à ';
            }
            result += catastrophe.city;
        }
        return result;
    },

    catastrophe_group: ({ named }: MessageContext) => {
        const group = named('group') as CatastropheGroup;

        const parts = [];
        if (group.instances.size > 1) {
            parts.push(group.instances.size.toString(), catastrophes[group.type][1].toLocaleLowerCase('fr-CA'));
        } else {
            parts.push(catastrophes[group.type][0]);
        }

        const best = group.instances.minBy(x => x.severity)!;
        const worst = group.instances.maxBy(x => x.severity)!;
        if (best.severity !== worst.severity) {
            parts.push('de sévérité', translateSeverity(best.severity, true), 'à', translateSeverity(worst.severity, true));
        } else {
            const feminine = isCatastropheFeminine(group.type);
            parts.push(translateSeverity(best.severity, feminine, group.instances.size > 1));
        }
        return parts.join(' ');
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