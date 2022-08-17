import axios, { AxiosError } from "axios";
import { Geometry, Position } from "geojson";
import { List, Map } from "immutable";
import { Candidate } from "./candidates";
import { Catastrophe, CatastropheDocument, CatastropheType, parseCatatrophe } from "./catastrophes";
import * as Sentry from "@sentry/vue";

export interface YearlySnapshot {
    year: number;
    catastrophes: List<Catastrophe>;
    regions: Map<number, RegionInfo>;
}

interface RegionStatistics {
    avg_temp?: number;
    avg_prec?: number;
    days_above_30?: number;
    days_below_min_25?: number;
}

export interface RegionInfo extends RegionStatistics {
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
        [id: string]: RegionStatistics
    };
}

export async function downloadDataForYear(year: number, refYear?: YearlySnapshot): Promise<YearlySnapshot> {
    try {
        const response = await axios.get<YearlySnapshotDocument>(`data/yearly_data/${year}.json`);
        const data = response.data;
        const snapshot: YearlySnapshot = {
            year,
            catastrophes: List(data.catastrophes.map(parseCatatrophe)),
            regions: Map(Object.entries(data.statistics).map(([k, v]) => {
                const regionId = parseInt(k);
                const refTemp = refYear?.regions.get(regionId)?.avg_temp;
                const info: RegionInfo = {
                    ...v,
                    temp_increase: v.avg_temp && refTemp ? v.avg_temp - refTemp : 0
                };
                return [regionId, info];
            }))
        };
        return snapshot;
    }
    catch (err) {
        if (!(err instanceof AxiosError) || !err.response || err.response.status !== 404) {
            // If we got something other than a 404, send it to Sentry
            Sentry.captureException(err);
        }
        return {
            year: year,
            catastrophes: List(),
            regions: Map()
        }
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

export function filterCatastrophesByRegion(catastropes: List<Catastrophe>, district: number, type: CatastropheType | ''): List<Catastrophe> {
    if(district === 0 && type === '') {
        return catastropes;
    }

    return catastropes.filter(x => {
        if(type && x.type !== type) {
            return false;
        }
        if(district === 0) {
            return true;
        }
        return district === x.district;
    });
}
