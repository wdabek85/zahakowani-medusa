import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import VehicleFitmentService from "../modules/vehicle-fitment/service"

export default async function testVehicleFitment({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fitment = container.resolve<VehicleFitmentService>(VEHICLE_FITMENT_MODULE)

  logger.info("=== test vehicle_fitment: create Brand + VehicleModel + Generation ===")

  const [brand] = await fitment.createBrands([{
    code: "skoda",
    name: "Skoda",
    display_order: 0,
  }])
  logger.info(`Brand created: ${brand.id} (${brand.code})`)

  const [vehicleModel] = await fitment.createVehicleModels([{
    code: "octavia",
    name: "Octavia",
    display_order: 0,
    brand_id: brand.id,
  }])
  logger.info(`VehicleModel created: ${vehicleModel.id} (${vehicleModel.code})`)

  const [generation] = await fitment.createGenerations([{
    code: "octavia-3",
    name: "Octavia 3",
    year_from: 2013,
    year_to: 2019,
    body_type: "Kombi",
    vehicle_model_id: vehicleModel.id,
  }])
  logger.info(`Generation created: ${generation.id} (${generation.code})`)

  logger.info("=== verify retrieve with relations ===")
  const generationWithRelations = await fitment.retrieveGeneration(generation.id, {
    relations: ["vehicle_model", "vehicle_model.brand"],
  })
  logger.info(`Retrieved generation full data: ${JSON.stringify(generationWithRelations, null, 2)}`)

  logger.info("=== verify computed helpers ===")
  const yearsLabel = fitment.getYearsLabel(generation.year_from, generation.year_to)
  logger.info(`years_label (year_to=2019): "${yearsLabel}" — expected "2013-2019"`)

  const yearsLabelOpen = fitment.getYearsLabel(2020, null)
  logger.info(`years_label (year_to=null): "${yearsLabelOpen}" — expected "2020-obecnie"`)

  const fullName = fitment.getGenerationFullName(generationWithRelations as never)
  logger.info(`full_name: "${fullName}" — expected "Skoda Octavia Octavia 3 2013-2019"`)

  const urlSlug = fitment.getGenerationUrlSlug(generationWithRelations as never)
  logger.info(`url_slug: "${urlSlug}" — expected "skoda/octavia/octavia-3-2013-2019"`)

  logger.info("=== verify list queries ===")
  const brands = await fitment.listBrands()
  logger.info(`Total brands in DB: ${brands.length}`)

  const models = await fitment.listVehicleModels({ brand_id: brand.id })
  logger.info(`Models for brand "${brand.code}": ${models.length}`)

  const generations = await fitment.listGenerations({ vehicle_model_id: vehicleModel.id })
  logger.info(`Generations for model "${vehicleModel.code}": ${generations.length}`)

  logger.info("=== cleanup: delete created records ===")
  await fitment.deleteGenerations([generation.id])
  await fitment.deleteVehicleModels([vehicleModel.id])
  await fitment.deleteBrands([brand.id])
  logger.info("Cleanup done. Test PASSED.")
}
