export interface AdminRegion {
    name: string;
    districts: number[];
}

export interface StatSnapshot {
    avg_temp: number | null;
    avg_prec: number | null;
}