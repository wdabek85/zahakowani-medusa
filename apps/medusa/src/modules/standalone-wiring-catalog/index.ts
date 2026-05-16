import { Module } from "@medusajs/framework/utils"
import StandaloneWiringCatalogService from "./service"

export const STANDALONE_WIRING_CATALOG_MODULE = "standalone_wiring_catalog"

export default Module(STANDALONE_WIRING_CATALOG_MODULE, {
  service: StandaloneWiringCatalogService,
})
