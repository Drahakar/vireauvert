import { LatLng, LatLngTuple } from "leaflet";

export enum CatastropheType {
    Flood = "FLOOD",
    ForestFire = "FOREST_FIRE",
    SevereWinds = "SEVERE_WINDS",
    Storm = "STORM",
    HeatWave = "HEAT_WAVE",
    Tornado = "TORNADO",
    Hurricane = "HURRICANE"
}

export interface Catastrophe {
    location: LatLng;
    description: string;
    type: CatastropheType;
    date: Date;
}

export interface CatastropheDocument {
    location: LatLngTuple;
    description: string;
    type: string;
    date: string;
}

export function parseCatatrophe(doc: CatastropheDocument): Catastrophe {
    return {
        location: new LatLng(doc.location[0], doc.location[1]),
        description: doc.description,
        type: doc.type as CatastropheType,
        date: new Date(doc.date)
    };
}
