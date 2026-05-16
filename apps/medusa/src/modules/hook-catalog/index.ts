import { Module } from "@medusajs/framework/utils"
import HookCatalogService from "./service"

export const HOOK_CATALOG_MODULE = "hook_catalog"

export default Module(HOOK_CATALOG_MODULE, {
  service: HookCatalogService,
})
