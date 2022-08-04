export interface RegionStatistics {
    average_temperature: (number | null)[];
    average_precipitations: (number | null)[];
}

export interface AdminRegion {
    name: string;
    districts: number[];
    statistics: RegionStatistics;
}

export interface StatSnapshot {
    average_temperature: number | null;
    average_precipitations: number | null;
}