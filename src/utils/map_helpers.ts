import L from "leaflet";

import { Catastrophe, CatastropheGroup, CatastropheType, getIconUrl } from "@/models/catastrophes";
import { temperatureGradient, getGradientColourIndex, colourToHex, multiplyColours } from "./colours";
import { Feature, Geometry } from "geojson";
import { DistrictProperties } from "@/models/map";
import { Composer } from "vue-i18n";

export interface DistrictLayer {
    feature: Feature<Geometry, DistrictProperties>;
    layer: L.GeoJSON;
}

const unselectedStyle: L.PathOptions = {
    fillColor: '#cccccc',
    color: 'var(--clr-blanc)',
    opacity: 0.9,
    fillOpacity: 0.5,
    weight: 1.5
};
const selectedStyle: L.PathOptions = {
    ...unselectedStyle,
    color: 'var(--clr-orange)',
    fillOpacity: 0.7,
    weight: 2
};

export function setMapLayerColour(layer: L.GeoJSON, selected: boolean, tempDelta?: number) {
    let style = selected ? selectedStyle : unselectedStyle;
    if (tempDelta) {
        let colour = temperatureGradient[getGradientColourIndex(tempDelta)];
        colour = multiplyColours(colour, [1, 0, 0], 0.9);
        style.fillColor = colourToHex(colour);
    }
    layer.setStyle(style);

    if (selected) {
        layer.bringToFront();
    } else {
        layer.bringToBack();
    }
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

export function createMapMarker(group: CatastropheGroup, i18n: Composer) {
    const marker = L.marker(group.location, {
        icon: mapIcons.get(group.type),
        opacity: 1
    });
    marker.bindTooltip(() => i18n.t('catastrophe_group', { group }));
    return marker;
}
