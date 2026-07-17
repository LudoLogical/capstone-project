import { Indicator } from "@/types/constants";
import { Region } from "@/types/geo";
import { DATUM_CVD_RATE, DATUM_OAT_RESOURCES } from "./seed";
import { AuthoritativeDatum, NSRServiceDatum } from "@/types/data";
import Initiative from "@/types/initiative";

export function getCensusTracts(regions: Region[]): Region[] {
  return regions; // TODO: Implementation to be handled by NSR
}

export function getAuthoritativeDatum(
  indicator: Indicator,
  censusTract: Region,
): AuthoritativeDatum {
  return DATUM_CVD_RATE; // TODO: Implementation to be handled by NSR
}

export function getNSRServiceData(initiative: Initiative): NSRServiceDatum[] {
  return [DATUM_OAT_RESOURCES]; // TODO: Implementation to be handled by NSR
}
