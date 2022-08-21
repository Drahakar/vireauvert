export type Colour = [number, number, number];

export function colourToHex(colour: Colour): string {
    return '#' + colour.map(x => {
        const val = Math.min(Math.floor(x * 255), 255);
        return val.toString(16).padStart(2, '0');
    }).join('');
}

function lerpColours(a: Colour, b: Colour, ratio: number): Colour {
    const f = (x: number, y: number, a: number) => x + a * (y - x);
    return [
        f(a[0], b[0], ratio),
        f(a[1], b[1], ratio),
        f(a[2], b[2], ratio)
    ];
}

function generateGradientSegment(a: string, b: string, count: number): Colour[] {
    const x = parseColour(a);
    const y = parseColour(b);

    const result: Colour[] = [];
    for (let i = 0; i <= count; ++i) {
        const step = lerpColours(x, y, i / count);
        result.push(step);
    }
    return result;
}

export const temperatureGradient: Colour[] = ([] as Colour[]).concat(
    generateGradientSegment('#99BBFF', '#FFEEEE', 15),
    generateGradientSegment('#FFEEEE', '#FFDD00', 10),
    generateGradientSegment('#FFDD00', '#FF0000', 42),
    generateGradientSegment('#FF0000', '#360000', 10),
);

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

export const gradientScale = 0.1;
export const minTemp = -1;

export function getGradientColourIndex(temperature: number) {
    return Math.min(temperatureGradient.length - 1, Math.max(0, Math.round((temperature - minTemp) / gradientScale)));
}

export function multiplyColours(base: Colour, add: Colour, ratio = 0.5): Colour {
    return [
        Math.min(1, (base[0] * ratio) + (add[0] * (1 - ratio))),
        Math.min(1, (base[1] * ratio) + (add[1] * (1 - ratio))),
        Math.min(1, (base[2] * ratio) + (add[2] * (1 - ratio)))
    ];
}