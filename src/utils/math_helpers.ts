export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, ratio: number) {
    return (1 - ratio) * a + ratio * b;
}
