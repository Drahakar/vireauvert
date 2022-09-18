import { List, Set } from "immutable";

export enum CatastropheType {
    Flood = "FLOOD",
    ForestFire = "FOREST_FIRE",
    ViolentStorm = "VIOLENT_STORM",
    Tornado = "TORNADO",
    FreezingRain = "FREEZING_RAIN",
    StormWinds = "STORM_WINDS",
    HeatWave = "HEAT_WAVE",
    Unknown = "UNKNOWN"
    // IFCHANGE: Add support to CatastropheToggle
}

export type CatastropheFilter = Set<CatastropheType>;

export const FILTER_ALL_CATASTROPHES = Set(Object.values(CatastropheType));

export interface CatastropheLocation {
    lat: number;
    lng: number
}

export interface MapObject {
    id: string;
    location: CatastropheLocation;
    type: CatastropheType;
}

export interface Catastrophe extends MapObject {
    city: string;
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

export interface CatastropheGroup {
    id: string;
    location: CatastropheLocation;
    city: string;
    type: CatastropheType;
    district: number;
    loc_approx: boolean;
    instances: List<Catastrophe>;
}

function mergeTypes(catastrophes: List<Catastrophe>) {
    const first = catastrophes.get(0)!.type;
    for (let i = 1; i < catastrophes.size; ++i) {
        if(catastrophes.get(i)!.type !== first) {
            return CatastropheType.Unknown;
        }
    }
    return first;
}

export function groupCatastrophes(catastrophes: List<Catastrophe>) {
    return catastrophes
        .groupBy(x => `${x.location.lat.toFixed(4)}/${x.location.lng.toFixed(4)}`)
        .map((x, k) => {
            const instances = x.toList();
            const first = instances.get(0)!;
            const group: CatastropheGroup = {
                id: k,
                type: mergeTypes(instances),
                location: first.location,
                city: first.city,
                district: first.district,
                loc_approx: x.some(x => x.loc_approx),
                instances
            };
            return group;
        }).toList();
}
