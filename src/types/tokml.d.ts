declare module 'tokml' {
  import type { FeatureCollection, GeoJSON } from 'geojson';

  interface TokmlOptions {
    name?: string;
    description?: string;
    documentName?: string;
    documentDescription?: string;
    simplestyle?: boolean;
  }

  function tokml(geojson: GeoJSON | FeatureCollection, options?: TokmlOptions): string;

  export default tokml;
}
