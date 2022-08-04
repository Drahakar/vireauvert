import { LatLng, LatLngTuple } from "leaflet";

export enum CatastropheType {
    Flood = "FLOOD",
    ForestFire = "FOREST_FIRE",
    ViolentStorm = "VIOLENT_STORM",
    Tornado = "TORNADO",
    FreezingRain = "FREEZING_RAIN",
    WinterStorm = "WINTER_STORM",
    StormWinds = "STORM_WINDS"
}

export interface Catastrophe {
    id: string;
    location: LatLng;
    city: string;
    type: CatastropheType;
    date: Date;
    severity: Severity;
}

export enum Severity {
    Unknown = 0,
    Minor = 1,
    Moderate = 2,
    Important = 3,
    Extreme = 4
}

export interface CatastropheDocument {
    id: string;
    location: LatLngTuple;
    city: string;
    type: string;
    date: string;
    severity: Severity;
}

export function parseCatatrophe(doc: CatastropheDocument): Catastrophe {
    return {
        id: doc.id,
        location: new LatLng(doc.location[0], doc.location[1]),
        city: doc.city,
        type: doc.type as CatastropheType,
        date: new Date(doc.date),
        severity: doc.severity
    };
}

function getTypeName(type: CatastropheType) {
    switch(type) {
        case CatastropheType.Flood:
            return 'Inondation';
        case CatastropheType.ForestFire:
            return 'Feu de forêt';
        case CatastropheType.ViolentStorm:
            return 'Orage violent';
        case CatastropheType.Tornado:
            return 'Tornade';
        case CatastropheType.FreezingRain:
            return 'Pluie verglaçante';
        case CatastropheType.WinterStorm:
            return 'Tempête hivernale';
        case CatastropheType.StormWinds:
            return 'Vents de tempête';
        default:
            return '';
    }
}

function getSeverityDescription(severity: Severity) {
    switch (severity) {
        case Severity.Extreme:
            return 'extrême';
        case Severity.Important:
            return 'important';
        case Severity.Moderate:
            return 'modéré';
        case Severity.Minor:
            return 'mineur';
        default:
            return '';
    }
}
export function formatDescription(catastrope: Catastrophe) {
    const plural = catastrope.type === CatastropheType.StormWinds;
    const feminine = catastrope.type === CatastropheType.Flood || catastrope.type === CatastropheType.Tornado || catastrope.type === CatastropheType.FreezingRain;

    let severity = getSeverityDescription(catastrope.severity);
    if (severity) {
        severity = `${getTypeName(catastrope.type)} ${severity}`;
        if (feminine && catastrope.severity != Severity.Extreme) {
            severity += 'e';
        }
        if (plural) {
            severity += 's';
        }
    }
    return severity;
}
