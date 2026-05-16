import { MedusaService } from "@medusajs/framework/utils"
import { Brand, VehicleModel, Generation } from "./models"

type GenerationWithRelations = {
  name: string
  code: string
  year_from: number
  year_to: number | null
  vehicle_model: {
    name: string
    code: string
    brand: {
      name: string
      code: string
    }
  }
}

class VehicleFitmentService extends MedusaService({
  Brand,
  VehicleModel,
  Generation,
}) {
  /**
   * Builds the human-readable year range label.
   * Returns "2013-2019" when year_to is set, "2013-obecnie" when null.
   */
  getYearsLabel(yearFrom: number, yearTo: number | null): string {
    return yearTo ? `${yearFrom}-${yearTo}` : `${yearFrom}-obecnie`
  }

  /**
   * Builds the full descriptive name used in product titles.
   * Example: "Skoda Octavia Octavia 3 2013-2019"
   */
  getGenerationFullName(generation: GenerationWithRelations): string {
    const yearsLabel = this.getYearsLabel(generation.year_from, generation.year_to)
    const brandName = generation.vehicle_model.brand.name
    const modelName = generation.vehicle_model.name
    return `${brandName} ${modelName} ${generation.name} ${yearsLabel}`
  }

  /**
   * Builds the URL slug used for SEO landing pages.
   * Example: "skoda/octavia/octavia-3-2013-2019"
   */
  getGenerationUrlSlug(generation: GenerationWithRelations): string {
    const yearsLabel = this.getYearsLabel(generation.year_from, generation.year_to)
    const brandCode = generation.vehicle_model.brand.code
    const modelCode = generation.vehicle_model.code
    return `${brandCode}/${modelCode}/${generation.code}-${yearsLabel}`
  }
}

export default VehicleFitmentService
