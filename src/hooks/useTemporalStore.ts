import { useStore } from 'zustand';
import type { TemporalState } from 'zundo';
import { usePolygonStore } from '../store/polygonStore';
import type { PolygonFeature, PolygonGroup } from '../types/polygon';

type TrackedState = { features: PolygonFeature[]; groups: PolygonGroup[] };

export function useTemporalStore<T>(
  selector: (state: TemporalState<TrackedState>) => T,
): T {
  return useStore(usePolygonStore.temporal, selector);
}
