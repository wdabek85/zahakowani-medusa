import { Module } from "@medusajs/framework/utils"
import VehicleFitmentService from "./service"

export const VEHICLE_FITMENT_MODULE = "vehicle_fitment"

export default Module(VEHICLE_FITMENT_MODULE, {
  service: VehicleFitmentService,
})
