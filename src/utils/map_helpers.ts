import L from "leaflet";

import { Catastrophe, CatastropheType, getIconUrl } from "@/models/catastrophes";
import { temperatureGradient, getGradientColourIndex, colourToHex, multiplyColours, parseColour } from "./colours";
import { Feature, Geometry } from "geojson";
import { DistrictProperties } from "@/models/map";
import { Composer } from "vue-i18n";

export interface DistrictLayer {
    feature: Feature<Geometry, DistrictProperties>;
    layer: L.GeoJSON;
}

const unselectedStyle: L.PathOptions = {
    fillColor: '#cccccc',
    color: '#333333',
    opacity: 0.8,
    fillOpacity: 0.5,
    weight: 1
};
const selectedStyle: L.PathOptions = {
    ...unselectedStyle,
    opacity: 1,
    fillOpacity: 0.7,
    weight: 2
};

export function setMapLayerColour(layer: L.GeoJSON, selected: boolean, tempDelta?: number) {
    let style = selected ? selectedStyle : unselectedStyle;
    if (tempDelta) {
        let colour = temperatureGradient[getGradientColourIndex(tempDelta)];
        colour = multiplyColours(colour, [1, 0, 0], 0.9);
        style = {
            ...style,
            fillColor: colourToHex(colour)
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

export function createMapMarker(catastrophe: Catastrophe, i18n: Composer) {
    const title = i18n.t('catastrophe_with_severity', { catastrophe });
    const marker = L.marker(catastrophe.location, {
        title: title,
        icon: mapIcons.get(catastrophe.type)
    });
    marker.bindTooltip(title);
    return marker;
}
