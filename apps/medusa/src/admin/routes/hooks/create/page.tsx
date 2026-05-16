import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, toast } from "@medusajs/ui"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { HookForm } from "../_components/hook-form"
import type { CreateHookInput } from "../../../../validators/hook"

const CreateHookPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSubmit = async (values: CreateHookInput) => {
    const r = await fetch("/admin/hooks", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!r.ok) {
      const body = (await r.json()) as { error?: string; details?: unknown }
      throw new Error(body.error ?? `HTTP ${r.status}`)
    }
    const body = (await r.json()) as { hook: { id: string; name: string } }
    toast.success(`Utworzono hak "${body.hook.name}"`)
    queryClient.invalidateQueries({ queryKey: ["admin-hooks"] })
    navigate(`/hooks/${body.hook.id}`)
  }

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h1">Nowy hak</Heading>
      </div>
      <div className="px-6 py-6">
        <HookForm
          onSubmit={handleSubmit}
          submitLabel="Dodaj hak"
          onCancel={() => navigate("/hooks")}
        />
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({})

export default CreateHookPage
