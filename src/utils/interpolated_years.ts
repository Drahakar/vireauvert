import { Range } from 'immutable';

// Helper to manage interpolated 'padding years' around modeled years, to
// produce some visual padding.
//
// E.g. instead of having:
// ... 2020 2021 2022 2030 2050 2100
// add some conceptual padding years 'P' before and between modeled years (in
// this example, use 3 'padding' years):
// ... 2020 2021 2022 P P P 2030 P P P 2050 P P P 2100
//
// For graphs, we linearly interpolate values on padding points between the real
// values.
//
// To use this class, make visual representations use the 'indices' produced by
// this class for positioning, while using helper classes to convert to/from
// years. For data mapped to years, use 'interpolate' to get interpolated data
// for each index.

export interface InterpolatedData {
    indices: number[];
    data: number[];
}

export class InterpolatedYears {
    continuous: number[];
    modeled: number[];
    padding: number;

    // How many indices do we have in total, with padding years?
    totalYearsPadded: number;

    constructor(continuousYears: number[], modeledYears: number[],
        paddingYears: number) {
        this.continuous = continuousYears;
        this.modeled = modeledYears;
        this.padding = paddingYears;

        this.totalYearsPadded = (
            this.continuous.length + (this.padding + 1) * this.modeled.length);
    }

    indexToYear(index: number): number {
        if (index < this.continuous.length) {
            return this.continuous[index];
        }
        const lastContinuousIndex = this.continuous.length - 1;
        index -= lastContinuousIndex;
        const numModeled = Math.round(index / (this.padding + 1));
        const modeledIndex = clamp(numModeled - 1, 0, this.modeled.length - 1);
        return this.modeled[modeledIndex];
    };

    yearToIndex(year: number): number {
        if (year <= this.continuous[this.continuous.length - 1]) {
            return year - this.continuous[0];
        }
        const modeledIndex = this.modeled.indexOf(year);
        const start = this.continuous.length + this.padding;
        return start + modeledIndex * (this.padding + 1);
    }

    interpolate(data: number[]): InterpolatedData {
        // Takes in datapoints that mapped to continuous + modeled years and
        // adds interpolated values where 'padding' years would lie.
        const interpolated: InterpolatedData = {
            indices: Range(0, this.continuous.length).toArray(),
            data: data.slice(0, this.continuous.length),
        };
        let index = this.continuous.length;
        let previous = data[index-1];
        for (const current of data.slice(index)) {
            Range(0, this.padding).forEach(i => {
                const ratio = (i + 1) / (this.padding + 1);
                const lerp = (1 - ratio) * previous + ratio * current;
                interpolated.indices.push(index);
                interpolated.data.push(lerp);
                ++index;
            });
            interpolated.indices.push(index);
            interpolated.data.push(current);
            previous = current;
        }
        return interpolated;
    }
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
