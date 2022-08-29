import { List } from "immutable";
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

export interface CatastropheLocation {
    lat: number;
    lng: number
}

export interface Catastrophe {
    id: string;
    location: CatastropheLocation;
    city: string;
    type: CatastropheType;
    date: Date;
    severity: Severity;
    district: number;
    loc_approx: boolean;
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
    loc_approx: boolean;
}

export function parseCatatrophe(doc: CatastropheDocument): Catastrophe {
    return {
        id: doc.id,
        location: { lat: doc.location[1], lng: doc.location[0] },
        city: doc.city,
        type: doc.type as CatastropheType,
        date: new Date(doc.date),
        severity: doc.severity,
        district: doc.district,
        loc_approx: doc.loc_approx
    };
}

export function getIconUrl(type: CatastropheType) {
    return `/icons/${type.toLowerCase()}_b.png`
}

export interface CatastropheGroup {
    id: string;
    location: CatastropheLocation;
    city: string;
    type: CatastropheType;
    district: number;
    loc_approx: boolean;
    instances: List<{
        id: string;
        date: Date;
        severity: Severity;
    }>;
}

export function groupCatastrophes(catastrophes: List<Catastrophe>) {
    return catastrophes
        .groupBy(x => `${x.type}/${x.location.lat.toFixed(4)}/${x.location.lng.toFixed(4)}`)
        .map((x, k) => {
            const first = x.first()!;
            const group: CatastropheGroup = {
                id: k,
                location: first.location,
                type: first.type,
                city: first.city,
                district: first.district,
                loc_approx: x.some(x => x.loc_approx),
                instances: x.toList()
            };
            return group;
        }).toList();
}