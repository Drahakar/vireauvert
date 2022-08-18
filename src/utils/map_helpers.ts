import L from "leaflet";

import { Catastrophe, formatDescription, CatastropheType, getIconUrl } from "@/models/catastrophes";
import { temperatureGradient, getGradientColourIndex, colourToHex, multiplyColours, parseColour } from "./colours";
import { Feature, Geometry } from "geojson";
import { DistrictProperties } from "@/models/map";

export interface DistrictLayer {
    feature: Feature<Geometry, DistrictProperties>;
    layer: L.GeoJSON;
}

const unselectedStyle: L.PathOptions = {
    fillColor: '#cccccc',
    color: '#333333',
    opacity: 0.5,    
    fillOpacity: 0.3,
    weight: 1
};
const selectedStyle: L.PathOptions = {
    ...unselectedStyle,
    fillColor: '#ffffff',
    opacity: 0.7,
    fillOpacity: 0.5,
    weight: 2
};

export function setMapLayerColour(layer: L.GeoJSON, selected: boolean, tempDelta?: number) {
    let style = selected ? selectedStyle : unselectedStyle;
    if (tempDelta) {
        const tempColour = temperatureGradient[getGradientColourIndex(tempDelta)];
        const newColour = colourToHex(multiplyColours(parseColour(style.fillColor), tempColour));
        style = {
            ...style,
            fillColor: newColour
        };
    }
    layer.setStyle(style);
}

function generateIcons(): Map<CatastropheType, L.Icon> {
    const icons = new Map<CatastropheType, L.Icon>();
    for (const value of Object.values(CatastropheType)) {
        const icon = L.icon({
            iconUrl: getIconUrl(value),
            iconSize: [48, 48]
        });
        icons.set(value, icon);
    }
    return icons;
}

export const mapIcons = generateIcons();

export function createMapMarker(catastrophe: Catastrophe) {
    const title = formatDescription(catastrophe);
    const marker = L.marker(catastrophe.location, {
        title: title,
        icon: mapIcons.get(catastrophe.type)
    });
    marker.bindTooltip(title);
    return marker;
}
