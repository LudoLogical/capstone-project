import type { Location, GeoPolygon, Region } from "../../types/geo";

/**
 * Geographic seed data for the Pittsburgh region.
 *
 * Locations are real coordinate points; Regions carry small illustrative
 * GeoPolygon boundaries (a single closed ring apiece) so the data satisfies
 * the GeoJSON-derived {@link Region} shape without shipping full census
 * geometry.
 */

export const LOCATIONS = {
  lawrenceville: {
    name: "Lawrenceville, Pittsburgh",
    latitude: 40.4657,
    longitude: -79.9614,
  },
  hazelwood: {
    name: "Hazelwood, Pittsburgh",
    latitude: 40.4093,
    longitude: -79.9436,
  },
  homewood: {
    name: "Homewood, Pittsburgh",
    latitude: 40.4571,
    longitude: -79.8956,
  },
  northside: {
    name: "Central Northside, Pittsburgh",
    latitude: 40.4557,
    longitude: -80.0157,
  },
  braddock: {
    name: "Braddock, Allegheny County",
    latitude: 40.4023,
    longitude: -79.8681,
  },
  hilltop: {
    name: "St. Clair / Hilltop, Pittsburgh",
    latitude: 40.4123,
    longitude: -79.9836,
  },
  manchester: {
    name: "Manchester, Pittsburgh",
    latitude: 40.4585,
    longitude: -80.0225,
  },
} satisfies Record<string, Location>;

/** Build a small rectangular GeoPolygon ring centered on a location. */
function boxAround(loc: Location, halfDeg = 0.01): GeoPolygon {
  const { latitude: lat, longitude: lng } = loc;
  const ring: Location[] = [
    { name: `${loc.name} NW`, latitude: lat + halfDeg, longitude: lng - halfDeg },
    { name: `${loc.name} NE`, latitude: lat + halfDeg, longitude: lng + halfDeg },
    { name: `${loc.name} SE`, latitude: lat - halfDeg, longitude: lng + halfDeg },
    { name: `${loc.name} SW`, latitude: lat - halfDeg, longitude: lng - halfDeg },
    { name: `${loc.name} NW`, latitude: lat + halfDeg, longitude: lng - halfDeg },
  ];
  return { coordinates: [ring] };
}

export const REGIONS = {
  lawrenceville: {
    name: "Lawrenceville (15201)",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.lawrenceville),
  },
  hazelwood: {
    name: "Greater Hazelwood (15207)",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.hazelwood),
  },
  homewood: {
    name: "Homewood (15208)",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.homewood),
  },
  northside: {
    name: "Central Northside (15212)",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.northside),
  },
  braddock: {
    name: "Braddock & North Braddock",
    isContiguous: false,
    coordinates: [boxAround(LOCATIONS.braddock), boxAround(LOCATIONS.hilltop, 0.006)],
  },
  hilltop: {
    name: "Hilltop Communities",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.hilltop),
  },
  manchester: {
    name: "Manchester (15233)",
    isContiguous: true,
    coordinates: boxAround(LOCATIONS.manchester),
  },
  alleghenyCounty: {
    name: "Allegheny County",
    isContiguous: true,
    coordinates: boxAround(
      { name: "Allegheny County", latitude: 40.4406, longitude: -79.9959 },
      0.28,
    ),
  },
  cityOfPittsburgh: {
    name: "City of Pittsburgh",
    isContiguous: true,
    coordinates: boxAround(
      { name: "City of Pittsburgh", latitude: 40.4406, longitude: -79.9959 },
      0.09,
    ),
  },
} satisfies Record<string, Region>;
