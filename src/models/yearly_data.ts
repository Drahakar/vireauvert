import axios from "axios";
import { Feature, Geometry, Position } from "geojson";
import pointInPolygon from "point-in-polygon";
import { Catastrophe, CatastropheDocument, parseCatatrophe } from "./catastrophes";
import { StatSnapshot } from "./regions";

export interface YearlySnapshot {
    catastrophes: Catastrophe[];
    statistics: StatSnapshot[];
}

export interface RegionSnapshot {
    catastrophes: Catastrophe[];
    statistics?: StatSnapshot;
}

interface YearlySnapshotDocument {
    catastrophes: CatastropheDocument[];
    statistics: StatSnapshot[];
}

export const EMPTY_SNAPSHOT: YearlySnapshot = {
    catastrophes: [],
    statistics: []
};

export async function downloadDataForYear(year: number): Promise<YearlySnapshot> {
    try {
        const response = await axios.get<YearlySnapshotDocument>(`data/yearly_data/${year}.json`);
        const data = response.data;
        return {
            catastrophes: data.catastrophes.map(parseCatatrophe),
            statistics: data.statistics
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

export function filterCatastrophesByRegion(catastropes: Catastrophe[], region: Feature) {
    if (region.geometry && catastropes.length > 0) {
        const polygons = getPolygons(region.geometry);
        return catastropes.filter(x => {
            const pt = [x.location.lng, x.location.lat];
            return polygons.some(poly => pointInPolygon(pt, poly));
        });
    }
    return [];
}
