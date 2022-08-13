import axios from "axios";
import { Feature, Geometry, Position } from "geojson";
import { List, Map } from "immutable";
import pointInPolygon from "point-in-polygon";
import { Candidate } from "./candidates";
import { Catastrophe, CatastropheDocument, parseCatatrophe } from "./catastrophes";

export interface YearlySnapshot {
    year: number;
    catastrophes: List<Catastrophe>;
    regions: Map<number, RegionInfo>;
}

export interface RegionInfo {
    avg_temp?: number;
    avg_prec?: number;
    temp_increase: number;
}

export interface RegionSnapshot {
    catastrophes: List<Catastrophe>;
    info?: RegionInfo;
    candidates: List<Candidate>;
    targetReachedOn?: number;
}

interface YearlySnapshotDocument {
    catastrophes: CatastropheDocument[];
    statistics: {
        [id: string]: {
            avg_temp?: number,
            avg_prec?: number
        }
    };
}

export async function downloadDataForYear(year: number, refYear?: YearlySnapshot): Promise<YearlySnapshot> {
    const response = await axios.get<YearlySnapshotDocument>(`data/yearly_data/${year}.json`);
    const data = response.data;
    const snapshot: YearlySnapshot = {
        year,
        catastrophes: List(data.catastrophes.map(parseCatatrophe)),
        regions: Map(Object.entries(data.statistics).map(([k, v]) => {
            const regionId = parseInt(k);
            const refTemp = refYear?.regions.get(regionId)?.avg_temp;
            const info: RegionInfo = {
                avg_temp: v.avg_temp,
                avg_prec: v.avg_prec,
                temp_increase: v.avg_temp && refTemp ? v.avg_temp - refTemp : 0
            };
            return [regionId, info];
        }))
    };
    return snapshot;

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
