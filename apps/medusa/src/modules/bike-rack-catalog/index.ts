import { Module } from "@medusajs/framework/utils"
import BikeRackCatalogService from "./service"

export const BIKE_RACK_CATALOG_MODULE = "bike_rack_catalog"

export default Module(BIKE_RACK_CATALOG_MODULE, {
  service: BikeRackCatalogService,
})
