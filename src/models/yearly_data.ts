import axios from "axios";
import { Feature, Geometry, Position } from "geojson";
import { List, Map } from "immutable";
import pointInPolygon from "point-in-polygon";
import { Candidate } from "./candidates";
import { Catastrophe, CatastropheDocument, parseCatatrophe } from "./catastrophes";

export interface YearlySnapshot {
    year: number;
    catastrophes: List<Catastrophe>;
    statistics: Map<number, StatSnapshot>;
    deltas?: Map<number, StatSnapshot>;
}

export interface StatSnapshot {
    avg_temp: number | null;
    avg_prec: number | null;
}

export interface RegionSnapshot {
    catastrophes: List<Catastrophe>;
    statistics?: StatSnapshot;
    candidates: List<Candidate>;
    delta?: StatSnapshot;
}

interface YearlySnapshotDocument {
    catastrophes: CatastropheDocument[];
    statistics: { [id: string]: StatSnapshot };
}

export const EMPTY_SNAPSHOT: YearlySnapshot = {
    year: 0,
    catastrophes: List(),
    statistics: Map()
};

function hasStats(snapshot: StatSnapshot) {
    return snapshot.avg_temp !== null && snapshot.avg_prec !== null;
}

const NULL_STATS: StatSnapshot = {
    avg_temp: 0,
    avg_prec: 0
}

function subtract(a: StatSnapshot, b: StatSnapshot): StatSnapshot {
    return {
        avg_temp: a.avg_temp !== null && b.avg_temp !== null ? a.avg_temp - b.avg_temp : null,
        avg_prec: a.avg_prec !== null && b.avg_prec !== null ? a.avg_prec - b.avg_prec : null,
    }
} 

export async function downloadDataForYear(year: number, refYear?: YearlySnapshot): Promise<YearlySnapshot> {
    try {
        const response = await axios.get<YearlySnapshotDocument>(`data/yearly_data/${year}.json`);
        const data = response.data;
        const snapshot: YearlySnapshot = {
            year,
            catastrophes: List(data.catastrophes.map(parseCatatrophe)),
            statistics: Map(Object.entries(data.statistics).map(([k, v]) => [parseInt(k), v])).filter(hasStats)
        };
        if (refYear) {
            snapshot.deltas = snapshot.statistics.map((snap, id) => {
                const refSnap = refYear.statistics.get(id);
                return refSnap ? subtract(snap, refSnap) : NULL_STATS;
            });
        }
        return snapshot;
    } catch {
        return {
            ...EMPTY_SNAPSHOT,
            year
        };
    }
}

function getPolygons(geometry: Geometry): Position[][] {
    if (geometry.type === "Polygon") {
        return geometry.coordinates;
    }
    if (geometry.type === "GeometryCollection") {
        const result: Position[][] = [];
        for (const g of geometry.geometries) {
            result.push(...getPolygons(g));
        }
        return result;
    }
    return [];
}

export function filterCatastrophesByRegion(catastropes: List<Catastrophe>, region?: Feature): List<Catastrophe> {
    if (region?.geometry && !catastropes.isEmpty()) {
        const polygons = getPolygons(region.geometry);
        return catastropes.filter(x => {
            const pt = [x.location.lng, x.location.lat];
            return polygons.some(poly => pointInPolygon(pt, poly));
        });
    }
    return List();
}
