import { Module } from "@medusajs/framework/utils"
import WiringEquipmentService from "./service"

export const WIRING_EQUIPMENT_MODULE = "wiring_equipment"

export default Module(WIRING_EQUIPMENT_MODULE, {
  service: WiringEquipmentService,
})
