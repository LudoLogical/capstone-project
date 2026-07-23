import type { Location, Region } from "@/types/geo";

// A handful of real neighborhood/landmark coordinates around Pittsburgh, PA,
// used as the `locations` of GrantAnalysis entries.
export const LOC_HILLTOP: Location = {
  name: "Hilltop, Pittsburgh, PA",
  latitude: 40.4179,
  longitude: -79.9889,
};

function ring(...points: Array<[number, number, string]>): Location[][] {
  const coords = points.map(([latitude, longitude, name]) => ({
    name,
    latitude,
    longitude,
  }));
  return [[...coords, coords[0]]];
}

export const REGION_PITTSBURGH: Region = {
  name: "City of Pittsburgh",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.4767, -80.0089, "NW corner"],
      [40.4756, -79.8655, "NE corner"],
      [40.3763, -79.8655, "SE corner"],
      [40.3763, -80.0356, "SW corner"],
    ),
  },
  censusTract: null,
};

// The census tract covering the Hilltop neighborhoods that Hilltop Wellness
// Collective serves. Every AuthoritativeDatum in this seed is reported at
// tract granularity, so this is the `region` all of them are drawn from.
export const REGION_HILLTOP_TRACT: Region = {
  name: "Census Tract 3010, Allegheny County, PA",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.4231, -79.9942, "NW corner"],
      [40.4231, -79.9831, "NE corner"],
      [40.4124, -79.9831, "SE corner"],
      [40.4124, -79.9942, "SW corner"],
    ),
  },
  censusTract: "3010",
};

export const REGION_ALLEGHENY_COUNTY: Region = {
  name: "Allegheny County",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.675, -80.2, "NW corner"],
      [40.675, -79.7, "NE corner"],
      [40.21, -79.7, "SE corner"],
      [40.21, -80.2, "SW corner"],
    ),
  },
  censusTract: null,
};

export const REGION_WESTMORELAND_COUNTY: Region = {
  name: "Westmoreland County",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.52, -79.7, "NW corner"],
      [40.52, -79.2, "NE corner"],
      [40.05, -79.2, "SE corner"],
      [40.05, -79.7, "SW corner"],
    ),
  },
  censusTract: null,
};

/** Every Region this seed draws an actual boundary for. */
export const SEEDED_REGIONS: Region[] = [
  REGION_PITTSBURGH,
  REGION_ALLEGHENY_COUNTY,
  REGION_WESTMORELAND_COUNTY,
  REGION_HILLTOP_TRACT,
];

/**
 * The Region a place name refers to.
 *
 * Where the seed knows the place, that Region is returned whole - boundary and
 * all. Everywhere else the name is all we have, so the Region is built around
 * it with no rings in its boundary: a place the user has named but that nothing
 * has drawn yet.
 *
 * In production this is where a geocoder goes. It would take the same string
 * and return the same shape, only with real coordinates, so nothing downstream
 * of here would change.
 */
export function regionNamed(name: string): Region {
  const trimmed = name.trim();
  const seeded = SEEDED_REGIONS.find(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (seeded) return seeded;
  return {
    name: trimmed,
    // Unknown until something draws it; a single unbroken boundary is the
    // ordinary case and the honest assumption for a named place.
    isContiguous: true,
    coordinates: { coordinates: [] },
    censusTract: null,
  };
}

/** Whether two Regions refer to the same place. */
export const sameRegion = (a: Region, b: Region) =>
  a.name.toLowerCase() === b.name.toLowerCase();

/**
 * The picked Regions that `options` doesn't already offer - places the user
 * named themselves. They are listed alongside the presets so a place the user
 * added is visible, and can be unpicked the same way any preset can.
 */
export const unlistedRegions = (picked: Region[], options: Region[]) =>
  picked.filter((p) => !options.some((o) => sameRegion(o, p)));
