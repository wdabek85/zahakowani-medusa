import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { createBrandSchema, type CreateBrandInput } from "../../../../../validators/vehicle-fitment"

const CreateBrandPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateBrandInput>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: { code: "", name: "", logo_url: null, display_order: 0 },
  })

  const onSubmit = async (values: CreateBrandInput) => {
    setSubmitting(true)
    try {
      const r = await fetch("/admin/vehicle-fitment/brands", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!r.ok) {
        const body = (await r.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${r.status}`)
      }
      toast.success("Marka utworzona")
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles-tree"] })
      navigate("/vehicles")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Heading level="h1">Nowa marka</Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 px-6 py-6">
        <Field label="Code (slug)" error={errors.code?.message} required>
          <Input {...register("code")} placeholder="np. skoda, ford, vw-tesla" />
          <Text size="xsmall" className="text-ui-fg-muted">
            Tylko małe litery, cyfry i myślniki. Używany w URL-ach (`/haki/skoda`).
          </Text>
        </Field>
        <Field label="Nazwa wyświetlana" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="np. Škoda" />
        </Field>
        <Field label="Logo URL" error={errors.logo_url?.message}>
          <Input {...register("logo_url")} placeholder="https://..." />
        </Field>
        <Field label="Kolejność wyświetlania" error={errors.display_order?.message}>
          <Input type="number" min={0} step={1} {...register("display_order", { valueAsNumber: true })} />
        </Field>
        <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/vehicles")} disabled={submitting}>Anuluj</Button>
          <Button type="submit" isLoading={submitting}>Dodaj markę</Button>
        </div>
      </form>
    </Container>
  )
}

const Field = ({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-1">
    <Label className="text-ui-fg-subtle">{label} {required && <span className="text-ui-fg-error">*</span>}</Label>
    {children}
    {error && <Text size="xsmall" className="text-ui-fg-error">{error}</Text>}
  </div>
)

export const config = defineRouteConfig({})
export default CreateBrandPage
