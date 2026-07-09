import type { Location, Region } from "@types-domain/geo";

// A handful of real neighborhood/landmark coordinates around Pittsburgh, PA,
// used as the `location` for AuthoritativeDatum entries and Initiative
// service areas.
export const LOC_HILLTOP: Location = {
  name: "Hilltop, Pittsburgh, PA",
  latitude: 40.4179,
  longitude: -79.9889,
};

export const LOC_BELTZHOOVER: Location = {
  name: "Beltzhoover, Pittsburgh, PA",
  latitude: 40.4142,
  longitude: -79.9928,
};

export const LOC_HOMEWOOD: Location = {
  name: "Homewood, Pittsburgh, PA",
  latitude: 40.4489,
  longitude: -79.8944,
};

export const LOC_EAST_LIBERTY: Location = {
  name: "East Liberty, Pittsburgh, PA",
  latitude: 40.4614,
  longitude: -79.9225,
};

export const LOC_NORTHVIEW_HEIGHTS: Location = {
  name: "Northview Heights, Pittsburgh, PA",
  latitude: 40.4816,
  longitude: -80.0219,
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
};

export const REGION_ALLEGHENY_COUNTY: Region = {
  name: "Allegheny County",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.6750, -80.2000, "NW corner"],
      [40.6750, -79.7000, "NE corner"],
      [40.2100, -79.7000, "SE corner"],
      [40.2100, -80.2000, "SW corner"],
    ),
  },
};

export const REGION_WESTMORELAND_COUNTY: Region = {
  name: "Westmoreland County",
  isContiguous: true,
  coordinates: {
    coordinates: ring(
      [40.5200, -79.7000, "NW corner"],
      [40.5200, -79.2000, "NE corner"],
      [40.0500, -79.2000, "SE corner"],
      [40.0500, -79.7000, "SW corner"],
    ),
  },
};
