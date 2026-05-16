import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { createVehicleModelSchema, type CreateVehicleModelInput } from "../../../../../validators/vehicle-fitment"

type Brand = { id: string; code: string; name: string }

const CreateModelPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { data: brandsData } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async (): Promise<{ brands: Brand[] }> => {
      const r = await fetch("/admin/vehicle-fitment/brands", { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
  })

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateVehicleModelInput>({
    resolver: zodResolver(createVehicleModelSchema),
    defaultValues: {
      brand_id: searchParams.get("brand_id") ?? "",
      code: "",
      name: "",
      display_order: 0,
    },
  })

  const onSubmit = async (values: CreateVehicleModelInput) => {
    setSubmitting(true)
    try {
      const r = await fetch("/admin/vehicle-fitment/models", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!r.ok) {
        const body = (await r.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${r.status}`)
      }
      toast.success("Model utworzony")
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
        <Heading level="h1">Nowy model pojazdu</Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 px-6 py-6">
        <Field label="Marka" error={errors.brand_id?.message} required>
          <Controller
            control={control}
            name="brand_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger><Select.Value placeholder="Wybierz markę..." /></Select.Trigger>
                <Select.Content>
                  {(brandsData?.brands ?? []).map((b) => (
                    <Select.Item key={b.id} value={b.id}>{b.name} ({b.code})</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
        </Field>
        <Field label="Code (slug)" error={errors.code?.message} required>
          <Input {...register("code")} placeholder="np. octavia" />
        </Field>
        <Field label="Nazwa" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="np. Octavia" />
        </Field>
        <Field label="Kolejność wyświetlania" error={errors.display_order?.message}>
          <Input type="number" min={0} step={1} {...register("display_order", { valueAsNumber: true })} />
        </Field>
        <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/vehicles")} disabled={submitting}>Anuluj</Button>
          <Button type="submit" isLoading={submitting}>Dodaj model</Button>
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
export default CreateModelPage
