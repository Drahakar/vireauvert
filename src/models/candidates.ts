export enum Party {
    CAQ = "CAQ",
    CQ = "CQ",
    PCQ = "PCQ",
    PLQ = "PLQ",
    PQ = "PQ",
    PV = "PV",
    QS = "QS"
}

export interface Candidate {
    name: string;
    party: Party;
    district: number;
    facebook?: string;
}
