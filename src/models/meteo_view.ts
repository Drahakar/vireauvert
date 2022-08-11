import { StatSnapshot } from "./yearly_data";

export interface StatOverlayControl {
    name: string;
    translateToOpacity(value: StatSnapshot): number;
}

export const averageTemperature: StatOverlayControl = {
    name: "Température",
    translateToOpacity: function (value: StatSnapshot): number {
        if (value.avg_temp === null) {
            return 0;
        }
        return value.avg_temp / 3;
    }
}
