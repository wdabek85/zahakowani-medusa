import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { BikeRackForm } from "../_components/bike-rack-form"
import type { CreateBikeRackInput } from "../../../../validators/bike-rack"

const CreateBikeRackPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSubmit = async (values: CreateBikeRackInput) => {
    const r = await fetch("/admin/bike-racks", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!r.ok) {
      const body = (await r.json()) as { error?: string }
      throw new Error(body.error ?? `HTTP ${r.status}`)
    }
    const body = (await r.json()) as { bike_rack: { id: string; name: string } }
    toast.success(`Utworzono bagażnik "${body.bike_rack.name}"`)
    queryClient.invalidateQueries({ queryKey: ["admin-bike-racks"] })
    navigate(`/bike-racks/${body.bike_rack.id}`)
  }

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h1">Nowy bagażnik rowerowy</Heading>
      </div>
      <div className="px-6 py-6">
        <BikeRackForm
          onSubmit={handleSubmit}
          submitLabel="Dodaj bagażnik"
          onCancel={() => navigate("/bike-racks")}
        />
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({})
export default CreateBikeRackPage
