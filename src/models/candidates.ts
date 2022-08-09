
export enum Party {
    CAQ = "CAQ",
    PLQ = "PLQ",
    PQ = "PQ",
    QS = "QS",
    PCQ = "PCQ",
    PV = "PV",
    CQ = "CQ"
}

export interface Candidate {
    name: string;
    party: Party;
    district: number;
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
}