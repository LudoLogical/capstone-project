/**
 * A single geographic coordinate.
 */
export type Location = {
  /**
   * A descriptive name for this GeoLocation
   * (e.g., "5000 Forbes Avenue").
   */
  name: string;
  latitude: number;
  longitude: number;
};

/**
 * A contiguous shape that defines the boundaries of a single, contiguous
 * geographic area. Based on the GeoJSON standard.
 */
export type GeoPolygon = {
  /**
   * An array of linear rings that define this GeoPolygon, the first of which
   * is its exterior boundary.
   */
  coordinates: Location[][];
};

/**
 * A geographic area (such as a city, county, or census tract) bounded by one
 * or more GeoPolygons.
 */
export type Region = {
  /**
   * A descriptive name for this Region
   * (e.g., "Allegheny County", "Zip Code 15213").
   */
  name: string;

  /**
   * True iff this Region is defined by a single, contiguous boundary. False
   * iff the defining boundary is not wholly continuous (like that of an
   * archipelago, for example).
   */
  isContiguous: boolean;

  /**
   * The GeoPolygon(s) that bound this Region. If an array is specified, the
   * whole is also known as a "MultiPolygon."
   */
  coordinates: GeoPolygon | GeoPolygon[];
};
