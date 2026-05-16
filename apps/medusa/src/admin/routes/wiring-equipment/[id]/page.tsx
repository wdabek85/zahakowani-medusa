import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Text, Input, Label, Switch, Textarea, IconButton, toast } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { updateWiringEquipmentSchema, type UpdateWiringEquipmentInput } from "../../../../validators/wiring-equipment"

type WiringEquipment = {
  id: string
  code: string
  type: "harness" | "module"
  pin_count: number
  name: string
  weight_kg: number
  description_html: string
  has_fog_lights: boolean
  has_reverse_lights: boolean
  has_stop_lights: boolean
  has_indicators: boolean
  homologation: string
  gallery: string[]
}

const EditWiringEquipmentPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [galleryText, setGalleryText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-wiring-equipment", id],
    queryFn: async (): Promise<{ wiring_equipment: WiringEquipment }> => {
      const r = await fetch(`/admin/wiring-equipment/${id}`, { credentials: "include" })
      if (r.status === 404) throw new Error("Nie istnieje")
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
    enabled: Boolean(id),
  })

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<UpdateWiringEquipmentInput>({
    resolver: zodResolver(updateWiringEquipmentSchema),
  })

  useEffect(() => {
    if (data?.wiring_equipment) {
      const we = data.wiring_equipment
      reset({
        name: we.name,
        weight_kg: we.weight_kg,
        description_html: we.description_html,
        has_fog_lights: we.has_fog_lights,
        has_reverse_lights: we.has_reverse_lights,
        has_stop_lights: we.has_stop_lights,
        has_indicators: we.has_indicators,
        homologation: we.homologation,
        gallery: we.gallery,
      })
      setGalleryText((we.gallery ?? []).join("\n"))
    }
  }, [data, reset])

  const onSubmit = async (values: UpdateWiringEquipmentInput) => {
    setSubmitting(true)
    try {
      const r = await fetch(`/admin/wiring-equipment/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!r.ok) {
        const body = (await r.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${r.status}`)
      }
      toast.success("Zapisano zmiany")
      queryClient.invalidateQueries({ queryKey: ["admin-wiring-equipment", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-wiring-equipment"] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd zapisu")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <Container className="p-6"><Text>Ładowanie...</Text></Container>
  if (isError || !data) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">{error instanceof Error ? error.message : "Błąd"}</Text>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/wiring-equipment"><ArrowLeft className="mr-2" /> Wróć</Link>
        </Button>
      </Container>
    )
  }

  const we = data.wiring_equipment
  const typeLabel = we.type === "module" ? "Moduł" : "Wiązka"

  return (
    <Container className="p-0">
      <div className="flex items-center gap-x-3 border-b border-ui-border-base px-6 py-4">
        <IconButton variant="transparent" asChild>
          <Link to="/wiring-equipment"><ArrowLeft /></Link>
        </IconButton>
        <div>
          <Heading level="h1">{typeLabel} {we.pin_count}-Pin</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            <Badge size="2xsmall" className="mr-2">{we.code}</Badge>
            Pola code/type/pin_count są stałe (read-only).
          </Text>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6 px-6 py-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Code (read-only)">
            <Input value={we.code} disabled />
          </FormField>
          <FormField label="Type (read-only)">
            <Input value={typeLabel} disabled />
          </FormField>
          <FormField label="Pin count (read-only)">
            <Input value={`${we.pin_count}-pin`} disabled />
          </FormField>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nazwa" error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Waga (kg)" error={errors.weight_kg?.message}>
            <Input type="number" min={0} step={1} {...register("weight_kg", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Homologacja" error={errors.homologation?.message}>
            <Input {...register("homologation")} />
          </FormField>
        </section>

        <FormField label="Opis HTML" error={errors.description_html?.message}>
          <Textarea rows={4} {...register("description_html")} />
        </FormField>

        <div>
          <Label className="text-ui-fg-subtle">Funkcje elektryczne</Label>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { name: "has_fog_lights", label: "Przeciwmgielne" },
              { name: "has_reverse_lights", label: "Cofania" },
              { name: "has_stop_lights", label: "Stop" },
              { name: "has_indicators", label: "Kierunkowskazy" },
            ] as const).map((f) => (
              <Controller
                key={f.name}
                control={control}
                name={f.name}
                render={({ field }) => (
                  <div className="flex items-center gap-x-2">
                    <Switch id={f.name} checked={field.value ?? false} onCheckedChange={field.onChange} />
                    <Label htmlFor={f.name} size="small">{f.label}</Label>
                  </div>
                )}
              />
            ))}
          </div>
        </div>

        <FormField label="Galeria (jeden URL w linii)">
          <Textarea
            rows={4}
            value={galleryText}
            onChange={(e) => {
              setGalleryText(e.target.value)
              const urls = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
              setValue("gallery", urls, { shouldValidate: true })
            }}
          />
        </FormField>

        <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/wiring-equipment")} disabled={submitting}>
            Anuluj
          </Button>
          <Button type="submit" isLoading={submitting}>Zapisz zmiany</Button>
        </div>
      </form>
    </Container>
  )
}

type FormFieldProps = { label: string; error?: string; children: React.ReactNode }
const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-y-1">
    <Label className="text-ui-fg-subtle">{label}</Label>
    {children}
    {error && <Text size="xsmall" className="text-ui-fg-error">{error}</Text>}
  </div>
)

export const config = defineRouteConfig({})
export default EditWiringEquipmentPage
