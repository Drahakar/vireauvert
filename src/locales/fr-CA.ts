import { Catastrophe, CatastropheGroup, CatastropheType, Severity } from "@/models/catastrophes";
import { MessageContext } from "@intlify/core-base";

function isCatastropheFeminine(type: CatastropheType) {
    return type === CatastropheType.Flood ||
        type === CatastropheType.Tornado ||
        type === CatastropheType.FreezingRain ||
        type === CatastropheType.HeatWave ||
        type === CatastropheType.Ticks;
}

const catastrophes = {
    FLOOD: ["Inondation", "Inondations"],
    FOREST_FIRE: ["Feu de forêt", "Feux de forêt"],
    VIOLENT_STORM: ["Orage violent", "Orages violents"],
    TORNADO: ["Tornade", "Tornades"],
    FREEZING_RAIN: ["Pluie verglaçante", "Pluies verglaçantes"],
    WINTER_STORM: ["Tempête hivernale", "Tempêtes hivernales"],
    STORM_WINDS: ["Vent de tempête", "Vents de tempête"],
    HEAT_WAVE: ["Vague de chaleur", "Vagues de chaleur"],
    TICKS: ["Tique", "Tiques"]
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
    if (plural && !result.endsWith('s')) {
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
    share: "Partager",
    help: "Aide",
    email: "Courriel",

    // Loading overlay
    loading: "Chargement des données...",

    // Catastrophes

    catastrophes: "Événement extrême | Événements extrêmes",
    catastrophe_UNKNOWN: "Événement extrême | Événements extrêmes",
    catastrophe_FLOOD: ({ plural }: MessageContext) => plural(catastrophes.FLOOD),
    catastrophe_FOREST_FIRE: ({ plural }: MessageContext) => plural(catastrophes.FOREST_FIRE),
    catastrophe_VIOLENT_STORM: ({ plural }: MessageContext) => plural(catastrophes.VIOLENT_STORM),
    catastrophe_TORNADO: ({ plural }: MessageContext) => plural(catastrophes.TORNADO),
    catastrophe_FREEZING_RAIN: ({ plural }: MessageContext) => plural(catastrophes.FREEZING_RAIN),
    catastrophe_WINTER_STORM: ({ plural }: MessageContext) => plural(catastrophes.WINTER_STORM),
    catastrophe_STORM_WINDS: ({ plural }: MessageContext) => plural(catastrophes.STORM_WINDS),
    catastrophe_HEAT_WAVE: ({ plural }: MessageContext) => plural(catastrophes.HEAT_WAVE),

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
        if (group.type === CatastropheType.Unknown) {
            return '';
        }

        const parts = [];

        if (group.city) {
            parts.push(`${group.city}:`);
        }

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

    // Catastrophe toggling
    toggle_checkbox_name_prefix: "Affichage pour ",
    all_catastrophes: "Tous",

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
    call_to_action: "Contactez vos candidat(e)s",

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
    timeline_mode_Temperature: "Température par année",
    timeline_mode_Catastrophes: "Événements extrêmes par année",

    // About
    about: "À propos de la Carte climat",
    about_welcome: "Bienvenue sur la Carte climat!",
    about_description: "Ce logiciel a été développé pour montrer l'impact des changements climatiques sur le Québec.",
    about_tutorial: "Si vous avez besoin d'explications en contexte, appuyez sur ce bouton: {0}",
    made_with_love: "La Carte climat a été conçue avec amour grâce à une collaboration entre {0}, {1} ainsi que {2}, {3} et {4}, trois programmeurs bénévoles.",
    data_source: "Les données utilisées dans ce logiciel proviennent du {0}, du {1} et du {2}.",
    ouranos: "consortium Ouranos",
    url_ouranos: "https://www.ouranos.ca/",
    qc_govt: "gouvernement du Québec",
    url_qc_govt: "https://donneesquebec.ca/",
    can_govt: "gouvernement du Canada",
    url_can_govt: "https://www.canada.ca/fr/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques.html",
    detailed_sources: "Sources",

    // Tutorial
    tutorial_title: "Tour guidé",
    tutorial_restart: "Recommencer le tutoriel",
    tutorial_next: "Suivant",
    tutorial_prev: "Précédent",
    tutorial_stop: "Quitter le tour",
    tutorial_step_msg: "Étape {0} de {1}",
    tutorial_step_welcome: "<p>Bienvenue sur la <b>Carte climat</b>!</p><p>Explorez les effets des changements climatiques sur le Québec.</p>",
    tutorial_step_ref_year: "<p>1990, année de référence par rapport à laquelle nous mesurons les réductions de gaz à effet de serre (GES).</p>",
    tutorial_step_goal: "<p>L'objectif de l'accord de Paris est de limiter l'augmentation de la température moyenne à l'échelle de la planète à <b>1,5 °C</b>.</p><p>C'est le point où les événements climatiques extrêmes pourraient être plus fréquents, plus intenses et occasionner de grandes perturbations dans toutes les sphères de notre quotidien.</p>",
    tutorial_step_temperature: "<p>Voici la température pour l'<b>année</b> et la <b>région</b> sélectionnées (ici 2022 pour la province de Québec).</p><p>Remarquez les changements de température par rapport à 1990 (ici +2,2 °C).</p>",
    tutorial_step_timeline: "<p>Vous pouvez changer l'<b>année</b> pour explorer les données de températures moyennes observées par le passé et les projections futures ainsi que les événements climatiques extrêmes survenus.</p>",
    tutorial_step_region_search: "<p>Sélectionnez la circonscription à afficher ou l'ensemble du Québec</p>",
    tutorial_step_catastrophes: "<p>Nombre d'événements extrêmes survenus dans la circonscription et l'année sélectionnées.</p><p>Vous pouvez sélectionner quels types d'événements extrêmes afficher (ici un total de <b>3 événements extrêmes</b>, dont 2 tornades et 1 vague de chaleur en 2022)</p>",
    tutorial_step_highlight: "<p>Certaines années contiennent des <b>faits saillants</b>. Cliquez sur l'icône pour en savoir plus.</p>",
    tutorial_step_call_to_action: "<p>Vous êtes préoccupé(e)s? <b>Contactez vos candidat(e)s</b> aux prochaines élections.</p>",    
    tutorial_step_end: "<p>Pour revoir ce tutoriel, ou pour de plus amples informations, consultez l'<b>aide</b>!</p>"
};
