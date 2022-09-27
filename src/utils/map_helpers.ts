import L from "leaflet";

import { CatastropheGroup, CatastropheType } from "@/models/catastrophes";
import { TEMPERATURE_THEME } from "./colours";
import { Feature, Geometry } from "geojson";
import { DistrictProperties } from "@/models/map";
import CatastropheDetails from "@/components/CatastropheDetails.vue";
import { AppContext, h, render, VNode } from "vue";
import { Highlight } from "@/models/highlights";
import HighlightView from "@/components/HighlightView.vue";
import { mark } from "@intlify/shared";

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
    if (tempDelta !== undefined) {
        style.fillColor = TEMPERATURE_THEME.getColour(tempDelta).toHex();
    }
    layer.setStyle(style);

    if (selected) {
        layer.bringToFront();
    } else {
        layer.bringToBack();
    }
}

function generateIcons(baseClassName: string, generateAsInnerDiv: boolean): Map<CatastropheType, L.DivIcon> {
    const icons = new Map<CatastropheType, L.DivIcon>();
    for (const value of Object.values(CatastropheType)) {
        const options: L.DivIconOptions = {
            iconSize: null as any
        };
        if (generateAsInnerDiv) {
            options.className = '';
            options.html = `<div class="${baseClassName} catastrophe-icon-${value.toLowerCase()}"></div>`;
        } else {
            options.className = `${baseClassName} catastrophe-icon-${value.toLowerCase()}`;
        }
        const icon = L.divIcon(options);
        icons.set(value, icon);
    }
    return icons;
}

const catastropheIcons = generateIcons('map-icon', false);
const highlightIcons = generateIcons('big-map-icon', true);

function createMarkerInternal(location: L.LatLngExpression, type: CatastropheType, iconMap: Map<CatastropheType, L.DivIcon>, zindex: number, appContext: AppContext, modelFactory: () => VNode) {
    const marker = L.marker(location, {
        icon: iconMap.get(type),
        opacity: 1
    });
    const popup = L.popup({
        className: `catastrophe-popup`,
        closeOnClick: false,
        closeButton: false
    });
    popup.setContent(() => {
        const div = document.createElement('div');

        // Workaround for https://github.com/Leaflet/Leaflet/issues/8159
        // Official Leaflet fix to be released in 1.8.1
        // Once the fix is in, we can put closeButton above back to true
        // and remove the following block of code
        const closeButton = document.createElement('a');
        closeButton.classList.add('leaflet-popup-close-button');
        closeButton.href = '#';
        closeButton.setAttribute('role', 'button');
        closeButton.ariaLabel = 'Close button';
        closeButton.innerHTML = '<img src="/Button/Close.svg">';
        closeButton.addEventListener('click', ev => {
            marker.closePopup();
            ev.preventDefault();
        });
        div.appendChild(closeButton);

        div.classList.add('popup-content-container');
        const details = modelFactory();
        details.appContext = appContext;
        render(details, div);
        return div;
    });
    marker.bindPopup(popup);
    marker.addEventListener('popupopen', ev => {
        ev.popup.options.maxHeight = window.innerHeight / 3;
        ev.popup.update();

        const elem = ev.popup.getElement();
        if(elem) {
            const popupContent = elem.querySelector('.leaflet-popup-content') as HTMLElement | null;
            if(popupContent) {
                popupContent.style.width = 'var(--popup-width)';
            }
        }
    });
    marker.setZIndexOffset(zindex);
    return marker;
}

export function createMapMarker(group: CatastropheGroup, appContext: AppContext) {
    return createMarkerInternal(group.location, group.type, catastropheIcons, 0, appContext, () => h(CatastropheDetails, { group }));
}

export function createHighlightMarker(highlight: Highlight, appContext: AppContext) {
    return createMarkerInternal(highlight.location, highlight.type, highlightIcons, 100, appContext, () => h(HighlightView, { highlight }));
}

export function setGlobalIconSize(ratio: number) {
    const root: HTMLElement | null = document.querySelector(':root');
    if (root) {
        root.style.setProperty('--icon-size', `${(ratio * 36).toFixed(0)}px`);
    }
}
