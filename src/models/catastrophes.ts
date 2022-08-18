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
    location: {
        lat: number;
        lng: number
    };
    city: string;
    type: CatastropheType;
    date: Date;
    severity: Severity;
    district: number;
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
    location: [number, number];
    city: string;
    type: string;
    date: string;
    severity: Severity;
    district: number;
}

export function parseCatatrophe(doc: CatastropheDocument): Catastrophe {
    return {
        id: doc.id,
        location: { lat: doc.location[0], lng: doc.location[1] },
        city: doc.city,
        type: doc.type as CatastropheType,
        date: new Date(doc.date),
        severity: doc.severity,
        district: doc.district
    };
}

export function getTypeName(type: CatastropheType) {
    switch (type) {
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
export function formatDescription(catastrophe: Catastrophe) {
    const plural = catastrophe.type === CatastropheType.StormWinds;
    const feminine = catastrophe.type === CatastropheType.Flood || catastrophe.type === CatastropheType.Tornado || catastrophe.type === CatastropheType.FreezingRain;

    let severity = getSeverityDescription(catastrophe.severity);
    if (severity) {
        severity = `${getTypeName(catastrophe.type)} ${severity}`;
        if (feminine && catastrophe.severity != Severity.Extreme) {
            severity += 'e';
        }
        if (plural) {
            severity += 's';
        }
    }
    return severity;
}

export function getIconUrl(type: CatastropheType) {
    return `/icons/${type.toLowerCase()}_b.png`
}