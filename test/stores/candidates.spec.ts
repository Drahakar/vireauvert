import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest'
import { List } from 'immutable';
import { useCandidateStore } from '../../src/stores/candidates';
import { Candidate, Party } from '../../src/models/candidates';

describe('Candidate Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return all district information', () => {
    const candidates: Candidate[] = [
      {
        name: 'Jean Lesage',
        district: 708,
        party: Party.PLQ
      },
      {
        name: 'René Lévesques',
        district: 250,
        party: Party.PQ
      }
    ]
    const store = useCandidateStore();
    store.candidates = List(candidates);

    expect(store.findCandidates(111).size).to.equal(0);
    expect(store.findCandidates(250).toArray()).to.eql(candidates.slice(1));
  });
});