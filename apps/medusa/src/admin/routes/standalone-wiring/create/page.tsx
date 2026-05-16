import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { StandaloneWiringForm } from "../_components/standalone-wiring-form"
import type { CreateStandaloneWiringInput } from "../../../../validators/standalone-wiring"

const CreateStandaloneWiringPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSubmit = async (values: CreateStandaloneWiringInput) => {
    const r = await fetch("/admin/standalone-wiring", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!r.ok) {
      const body = (await r.json()) as { error?: string }
      throw new Error(body.error ?? `HTTP ${r.status}`)
    }
    const body = (await r.json()) as { standalone_wiring: { id: string; name: string } }
    toast.success(`Utworzono wiązkę "${body.standalone_wiring.name}"`)
    queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring"] })
    navigate(`/standalone-wiring/${body.standalone_wiring.id}`)
  }

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h1">Nowa wiązka / moduł standalone</Heading>
      </div>
      <div className="px-6 py-6">
        <StandaloneWiringForm
          onSubmit={handleSubmit}
          submitLabel="Dodaj wiązkę"
          onCancel={() => navigate("/standalone-wiring")}
        />
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({})
export default CreateStandaloneWiringPage
