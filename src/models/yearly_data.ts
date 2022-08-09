import axios from "axios";
import { Feature, Geometry, Position } from "geojson";
import { List, Map } from "immutable";
import pointInPolygon from "point-in-polygon";
import { Candidate } from "./candidates";
import { Catastrophe, CatastropheDocument, parseCatatrophe } from "./catastrophes";

export interface YearlySnapshot {
    catastrophes: List<Catastrophe>;
    statistics: Map<number, StatSnapshot>;
}

export interface StatSnapshot {
    avg_temp: number | null;
    avg_prec: number | null;
}

export interface RegionSnapshot {
    catastrophes: List<Catastrophe>;
    statistics?: StatSnapshot;
    candidates: List<Candidate>;
}

interface YearlySnapshotDocument {
    catastrophes: CatastropheDocument[];
    statistics: { [id: string]: StatSnapshot };
}

export const EMPTY_SNAPSHOT: YearlySnapshot = {
    catastrophes: List(),
    statistics: Map()
};

export async function downloadDataForYear(year: number): Promise<YearlySnapshot> {
    try {
        const response = await axios.get<YearlySnapshotDocument>(`data/yearly_data/${year}.json`);
        const data = response.data;
        return {
            catastrophes: List(data.catastrophes.map(parseCatatrophe)),
            statistics: Map(Object.entries(data.statistics).map(([k, v]) => [parseInt(k), v])).filter(x => x.avg_prec !== null || x.avg_prec !== null)
        };
    } catch {
        return EMPTY_SNAPSHOT;
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
