import { StatSnapshot } from "./yearly_data";

function hsv2rgb(h: number, s: number, v: number) {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const hex = (n: number) => (Math.floor(f(n) * 255)).toString(16).padStart(2, '0');
    return `#${hex(5)}${hex(3)}${hex(1)}`;
}

function getColor(value: number, min: number, max: number) {
    const ratio = 1 - Math.min(1, Math.max(0, (value - min) / (max - min)));
    return hsv2rgb(ratio * 240, 1, 1);
}

export interface StatOverlayParameters {
    color: string;
    opacity: number;
}

const INVISIBLE: StatOverlayParameters = { color: '#ffffff', opacity: 0 };

export interface StatOverlayControl {
    translateToOpacity(value: StatSnapshot): StatOverlayParameters;
}

export const averageTemperature: StatOverlayControl = {
    translateToOpacity: function (value: StatSnapshot): StatOverlayParameters {
        if (value.avg_temp == undefined) {
            return INVISIBLE;
        }
        return {
            color: getColor(value.avg_temp, 3, 9),
            opacity: 0.3
        };
    }
}

export const averagePrecipitations: StatOverlayControl = {
    translateToOpacity: function (value: StatSnapshot): StatOverlayParameters {
        if (value.avg_prec === null) {
            return INVISIBLE;
        }
        return {
            color: getColor(value.avg_prec, 900, 1200),
            opacity: 0.3
        };
    }
}
