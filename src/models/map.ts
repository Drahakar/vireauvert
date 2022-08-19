import { List } from 'immutable';
import data from './districts.json';

export interface DistrictProperties {
    id: number;
    name: string;
}

const collator = new Intl.Collator('fr', { sensitivity: 'base' });
export const allDistricts = List(Object.entries(data).map(([k, v]) => ({ id: parseInt(k, 10), name: v })).sort((a, b) => collator.compare(a.name, b.name)));