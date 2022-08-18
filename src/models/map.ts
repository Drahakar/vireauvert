import { List } from 'immutable';
import data from './districts.json';

export interface DistrictProperties {
    id: number;
    name: string;
}

const collator = new Intl.Collator('fr', { sensitivity: 'base' });
export const allDistricts = List(data as DistrictProperties[]).sort((a, b) => collator.compare(a.name, b.name));