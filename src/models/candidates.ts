import { Map } from "immutable";

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
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
}

export interface PartyDescription {
    name: string;
    logo: string;
    color: string;
}
