import L, { DivOverlay } from "leaflet";

import { CatastropheGroup, CatastropheType } from "@/models/catastrophes";
import { temperatureGradient, getGradientColourIndex, colourToHex, multiplyColours } from "./colours";
import { Feature, Geometry } from "geojson";
import { DistrictProperties } from "@/models/map";
import CatastropheDetails from "@/components/CatastropheDetails.vue";
import { AppContext, h, render } from "vue";

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

function generateIcons(): Map<CatastropheType, L.DivIcon> {
    const icons = new Map<CatastropheType, L.DivIcon>();
    for (const value of Object.values(CatastropheType)) {
        const icon = L.divIcon({
            className: `map-icon catastrophe-icon-${value.toLowerCase()}`,
            iconSize: null as any
        });
        icons.set(value, icon);
    }
    return icons;
}

export const mapIcons = generateIcons();

export function createMapMarker(group: CatastropheGroup, appContext: AppContext) {
    const marker = L.marker(group.location, {
        icon: mapIcons.get(group.type),
        opacity: 1
    });
    const popup = L.popup({
        className: 'catastrophe-popup',
        closeButton: false,
        minWidth: 500,
        maxHeight: 400,
    });
    popup.setContent(() => {
        const div = document.createElement('div');
        const details = h(CatastropheDetails, { group });
        details.appContext = appContext;
        render(details, div);
        return div;
    });
    marker.bindPopup(popup);
    return marker;
}

export function setGlobalIconSize(ratio: number) {
    const root: HTMLElement | null = document.querySelector(':root');
    if (root) {
        root.style.setProperty('--icon-size', `${(ratio * 48).toFixed(0)}px`);
    }
}