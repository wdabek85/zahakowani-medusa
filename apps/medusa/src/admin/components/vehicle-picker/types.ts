export type VehicleGeneration = {
  id: string
  code: string
  name: string
  year_from: number
  year_to: number | null
  body_type: string | null
  years_label: string
}

export type VehicleModel = {
  id: string
  code: string
  name: string
  generations: VehicleGeneration[]
}

export type VehicleBrand = {
  id: string
  code: string
  name: string
  logo_url: string | null
  models: VehicleModel[]
}
