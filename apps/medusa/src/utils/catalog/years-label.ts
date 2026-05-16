/**
 * Pure version of VehicleFitmentService.getYearsLabel — usable inside utils
 * without resolving the module service.
 */
export function getYearsLabel(yearFrom: number, yearTo: number | null): string {
  return yearTo ? `${yearFrom}-${yearTo}` : `${yearFrom}-obecnie`
}
