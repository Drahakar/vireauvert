import L from "leaflet";

import { Catastrophe, CatastropheGroup, CatastropheType, getIconUrl } from "@/models/catastrophes";
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
    color: '#fbfbfb',
    opacity: 0.9,
    fillOpacity: 0.5,
    weight: 1.5
};
const selectedStyle: L.PathOptions = {
    ...unselectedStyle,
    color: '#ff6a0e',
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

function createMarkerPopup(group: CatastropheGroup, i18n: Composer) {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'list-group-flush');
    for (const instance of group.instances) {
        const catastrophe: Catastrophe = {
            ...group,
            ...instance
        }

        const time = document.createElement('time');
        time.dateTime = catastrophe.date.toISOString();
        time.innerText = i18n.d(catastrophe.date, 'event_date');

        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.append(time, ': ', i18n.t('catastrophe_with_severity', { catastrophe }));

        list.append(listItem);
    }
    const popup = L.popup({
        closeButton: false,
        closeOnClick: true,
        className: 'catastrophe-popup'
    });
    popup.setContent(list);
    return popup;
}

export function createMapMarker(group: CatastropheGroup, i18n: Composer) {
    const title = i18n.t('catastrophe_group', { group });
    const marker = L.marker(group.location, {
        title: title,
        icon: mapIcons.get(group.type),
        opacity: 1,
        alt: i18n.t(`catastrophe_${group.type}`, group.instances.size)
    });
    marker.bindTooltip(title);
    const popup = createMarkerPopup(group, i18n);
    marker.bindPopup(popup);
    return marker;
}
