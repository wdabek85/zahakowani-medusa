import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text, IconButton, toast } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { createBrandSchema, type CreateBrandInput } from "../../../../../validators/vehicle-fitment"

const EditBrandPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-brand", id],
    queryFn: async () => {
      const r = await fetch(`/admin/vehicle-fitment/brands/${id}`, { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<{ brand: CreateBrandInput & { id: string } }>
    },
    enabled: Boolean(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBrandInput>({
    resolver: zodResolver(createBrandSchema),
  })

  useEffect(() => {
    if (data?.brand) reset(data.brand)
  }, [data, reset])

  const onSubmit = async (values: CreateBrandInput) => {
    setSubmitting(true)
    try {
      const r = await fetch(`/admin/vehicle-fitment/brands/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!r.ok) {
        const body = (await r.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${r.status}`)
      }
      toast.success("Zapisano")
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles-tree"] })
      navigate("/vehicles")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <Container className="p-6"><Text>Ładowanie...</Text></Container>

  return (
    <Container className="p-0">
      <div className="flex items-center gap-x-3 border-b border-ui-border-base px-6 py-4">
        <IconButton variant="transparent" asChild><Link to="/vehicles"><ArrowLeft /></Link></IconButton>
        <Heading level="h1">Edycja marki: {data?.brand.name}</Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 px-6 py-6">
        <Field label="Code (slug)" error={errors.code?.message} required>
          <Input {...register("code")} />
        </Field>
        <Field label="Nazwa" error={errors.name?.message} required>
          <Input {...register("name")} />
        </Field>
        <Field label="Logo URL" error={errors.logo_url?.message}>
          <Input {...register("logo_url")} />
        </Field>
        <Field label="Kolejność wyświetlania" error={errors.display_order?.message}>
          <Input type="number" min={0} step={1} {...register("display_order", { valueAsNumber: true })} />
        </Field>
        <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/vehicles")} disabled={submitting}>Anuluj</Button>
          <Button type="submit" isLoading={submitting}>Zapisz</Button>
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
export default EditBrandPage
