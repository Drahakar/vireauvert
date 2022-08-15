import { FeatureCollection } from 'geojson';
import { createPinia, setActivePinia } from 'pinia';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../src/stores/store';

describe('Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return all district information', () => {
    const map: FeatureCollection = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: []
        },
        properties: {
          id: 3,
          name: 'Serbia'
        }
      }, {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: []
        },
        properties: {
          id: 7,
          name: 'Mongolia'
        }
      }]
    };
    const store = useStore();
    store.electoralMap = map;

    expect(store.allDistricts).to.eql([{ id: 7, name: 'Mongolia' }, { id: 3, name: 'Serbia' }]);
  });
});