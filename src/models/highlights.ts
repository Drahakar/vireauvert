import { MapObject } from "./catastrophes";

export interface Highlight extends MapObject {
    year: number;
    locale: string;
    title: string;
    body: string;
}

