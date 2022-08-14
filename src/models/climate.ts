function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [f(0), f(8), f(4)];
}

function colourToHex(components: [number, number, number]): string {
    return '#' + components.map(x => {
        const val = Math.min(Math.floor(x * 256), 255);
        return val.toString(16).padStart(2, '0');
    }).join('');
}

export const temperatureGradient: string[] = Array.from(Array(41).keys()).map(x => {
    const ratio = (1 - (x / 40)) * 50;
    const colour = hslToRgb(ratio, 1, 0.5);
    return colourToHex(colour);
});

export function getGradientColourIndex(temperature: number) {
    return Math.min(temperatureGradient.length - 1, Math.max(0, Math.round(temperature * 10)));
}