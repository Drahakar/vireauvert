import { List, Map } from 'immutable';
import data from './admin_regions.json';

export interface AdminRegion {
    id: number;
    name: string;
    districts: number[];
}

export const allRegions = List(data as AdminRegion[]);

const districtToRegion = Map(allRegions.flatMap(r => r.districts.map(d => [d, r])));

export function findRegionByDistrict(id: number) {
    return districtToRegion.get(id);
}