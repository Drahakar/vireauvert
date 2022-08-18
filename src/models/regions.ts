import { List } from 'immutable';
import data from './admin_regions.json';

export interface AdminRegion {
    id: number;
    name: string;
    districts: number[];
}

export const allRegions = List(data as AdminRegion[]);

export function findRegionByDistrict(id: number) {
    return allRegions.find(x => x.districts.some(y => y === id));
}