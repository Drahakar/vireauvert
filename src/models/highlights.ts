import { MapObject } from "./catastrophes";

export interface LocalizedText {
    [locale: string]: string;
}

export interface Highlight extends MapObject {
    year: number;
    title: LocalizedText;
    body: LocalizedText;
}

