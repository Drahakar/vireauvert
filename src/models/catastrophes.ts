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
    location: LatLng;
    description: string;
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
    location: LatLngTuple;
    description: string;
    type: string;
    date: string;
    severity: Severity;
}

export function parseCatatrophe(doc: CatastropheDocument): Catastrophe {
    return {
        location: new LatLng(doc.location[0], doc.location[1]),
        description: doc.description,
        type: doc.type as CatastropheType,
        date: new Date(doc.date),
        severity: doc.severity
    };
}
