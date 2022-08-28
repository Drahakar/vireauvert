import { DistrictProperties } from "@/models/map";
import axios from "axios";
import { FeatureCollection, Geometry, Polygon } from "geojson";
import { defineStore } from "pinia";

export const useMapStore = defineStore('Map', {
    state: () => {
        return {
            districts: undefined as FeatureCollection<Geometry, DistrictProperties> | undefined,
            mask: undefined as Polygon | undefined
        }
    },
    actions: {
        async loadMap() {
            const [districtResponse, maskResponse] = await Promise.all([
                axios.get<FeatureCollection<Geometry, DistrictProperties>>("data/carte_electorale.json", { responseType: "json" }),
                axios.get<Polygon>("data/masque_electoral.json", { responseType: "json" })
            ]);
            this.districts = districtResponse.data;
            this.mask = maskResponse.data;
        }
    }
});