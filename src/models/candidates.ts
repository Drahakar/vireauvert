export enum Party {
    CAQ = "CAQ",
    CQ = "CQ",
    PCQ = "PCQ",
    PLQ = "PLQ",
    PQ = "PQ",
    PV = "PV",
    QS = "QS"
}

export function getPartyName(party: Party) {
    switch (party) {
        case Party.CAQ:
            return 'Coalition Avenir Québec';
        case Party.CQ:
            return 'Climat Québec';
        case Party.PCQ:
            return 'Parti Conservateur du Québec';
        case Party.PLQ:
            return 'Parti Libéral du Québec';
        case Party.PQ:
            return 'Parti Québécois';
        case Party.PV:
            return 'Parti Vert du Québec';
        case Party.QS:
            return 'Québec Solidaire';
    }
}

export interface Candidate {
    name: string;
    party: Party;
    district: number;
    facebook?: string;
}
