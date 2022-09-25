export class Colour {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static fromHex(hex: string): Colour {
        const r = parseInt(hex.substring(1, 3), 16) / 255;
        const g = parseInt(hex.substring(3, 5), 16) / 255;
        const b = parseInt(hex.substring(5, 7), 16) / 255;
        return new Colour(r, g, b);
    }

    toHex(alpha: number = 1.0): string {
        function hexify(x: number) {
            const val = Math.min(Math.floor(x * 255), 255);
            return val.toString(16).padStart(2, '0');
        }
        const hex = '#' + [this.r, this.g, this.b].map(hexify).join('');
        return alpha < 1.0 ? hex + hexify(alpha) : hex;
    }

    lerp(b: Colour, ratio: number): Colour {
        const f = (x: number, y: number, a: number) => x + a * (y - x);
        return new Colour(
            f(this.r, b.r, ratio),
            f(this.g, b.g, ratio),
            f(this.b, b.b, ratio),
        );
    }
}

interface Stop {
    temp_delta: number;
    colour: Colour;
}

export class ColourTheme {
    stops: Stop[];

    constructor(stops: Stop[]) {
        this.stops = stops;
    }

    // TODO: toCanvasGradient, with alpha handling

    getColour(temp_delta: number): Colour {
        let previousStop = this.stops[0];
        for (const stop of this.stops) {
            if (temp_delta < stop.temp_delta) {
                const gap = stop.temp_delta - previousStop.temp_delta;
                const value = temp_delta - previousStop.temp_delta;
                const alpha = gap > 0 ? value / gap : 0.0;
                return previousStop.colour.lerp(stop.colour, alpha);
            }
            previousStop = stop;
        }
        return previousStop.colour;  // Return the last stop's colour.
    }
}

export const DEFAULT_THEME = new ColourTheme([
    { temp_delta: -1.0, colour: Colour.fromHex('#99C5DD') },
    { temp_delta: +0.0, colour: Colour.fromHex('#E5E3E2') },
    { temp_delta: +1.5, colour: Colour.fromHex('#F0AD00') },
    { temp_delta: +4.0, colour: Colour.fromHex('#FF3B3B') },
    { temp_delta: +8.0, colour: Colour.fromHex('#360000') },
]);
