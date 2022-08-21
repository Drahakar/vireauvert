import { Composer } from "vue-i18n";

export enum CatastropheType {
    Flood = "FLOOD",
    ForestFire = "FOREST_FIRE",
    ViolentStorm = "VIOLENT_STORM",
    Tornado = "TORNADO",
    FreezingRain = "FREEZING_RAIN",
    WinterStorm = "WINTER_STORM",
    StormWinds = "STORM_WINDS"
}

export type CatastropheFilter = CatastropheType | '';

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

export function getIconUrl(type: CatastropheType) {
    return `/icons/${type.toLowerCase()}_b.png`
}