import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text, IconButton, toast } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { updateGenerationSchema } from "../../../../../validators/vehicle-fitment"
import { TextAutocomplete } from "../../../../components/text-autocomplete"
import { createAutocompleteFetcher } from "../../../../components/text-autocomplete/fetchers"

type GenerationDetail = {
  id: string
  vehicle_model_id: string
  code: string
  name: string
  year_from: number
  year_to: number | null
  body_type: string | null
}

type FormValues = {
  code: string
  name: string
  year_from: number
  year_to: number | null
  body_type: string | null
}

const fetchBodyTypes = createAutocompleteFetcher("body-types")

const EditGenerationPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-generation", id],
    queryFn: async () => {
      const r = await fetch(`/admin/vehicle-fitment/generations/${id}`, { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<{ generation: GenerationDetail }>
    },
    enabled: Boolean(id),
  })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(updateGenerationSchema),
  })

  useEffect(() => {
    if (data?.generation) {
      const g = data.generation
      reset({ code: g.code, name: g.name, year_from: g.year_from, year_to: g.year_to, body_type: g.body_type })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const r = await fetch(`/admin/vehicle-fitment/generations/${id}`, {
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
        <Heading level="h1">Edycja generacji: {data?.generation.name}</Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 px-6 py-6">
        <Field label="Code" error={errors.code?.message} required><Input {...register("code")} /></Field>
        <Field label="Nazwa" error={errors.name?.message} required><Input {...register("name")} /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Rok od" error={errors.year_from?.message} required>
            <Input type="number" min={1900} max={2100} {...register("year_from", { valueAsNumber: true })} />
          </Field>
          <Field label="Rok do (puste = obecnie)" error={errors.year_to?.message}>
            <Input
              type="number"
              min={1900}
              max={2100}
              {...register("year_to", { setValueAs: (v) => v === "" || v == null ? null : Number(v) })}
            />
          </Field>
        </div>
        <Field label="Typ nadwozia" error={errors.body_type?.message}>
          <Controller
            control={control}
            name="body_type"
            render={({ field }) => (
              <TextAutocomplete
                value={field.value ?? ""}
                onChange={(v) => field.onChange(v || null)}
                fetchSuggestions={fetchBodyTypes}
                placeholder="np. Kombi, SUV, Sedan, Hatchback"
              />
            )}
          />
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
export default EditGenerationPage
