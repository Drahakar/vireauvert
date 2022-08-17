export type Colour = [number, number, number];

function hslToRgb(h: number, s: number, l: number): Colour {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [f(0), f(8), f(4)];
}

export function colourToHex(colour: Colour): string {
    return '#' + colour.map(x => {
        const val = Math.min(Math.floor(x * 255), 255);
        return val.toString(16).padStart(2, '0');
    }).join('');
}

export const temperatureGradient: Colour[] = Array.from(Array(41).keys()).map(x => {
    const ratio = (1 - (x / 40)) * 50;
    const colour = hslToRgb(ratio, 1, 0.5);
    return colour;
});

export function parseColour(value?: string): Colour {
    if (!value) {
        return [1, 1, 1];
    }
    return [
        parseInt(value.slice(1, 3), 16) / 255,
        parseInt(value.slice(3, 5), 16) / 255,
        parseInt(value.slice(5), 16) / 255,
    ];
}

export function getGradientColourIndex(temperature: number) {
    return Math.min(temperatureGradient.length - 1, Math.max(0, Math.round(temperature * 10)));
}

export function multiplyColours(a: Colour, b: Colour): Colour {
    return [
        Math.min(1, a[0] * b[0]),
        Math.min(1, a[1] * b[1]),
        Math.min(1, a[2] * b[2])
    ];
}