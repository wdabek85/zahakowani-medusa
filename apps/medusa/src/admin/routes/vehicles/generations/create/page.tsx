import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { createGenerationSchema, type CreateGenerationInput } from "../../../../../validators/vehicle-fitment"
import { TextAutocomplete } from "../../../../components/text-autocomplete"
import { createAutocompleteFetcher } from "../../../../components/text-autocomplete/fetchers"

type TreeBrand = {
  id: string; name: string
  models: Array<{ id: string; name: string }>
}

const fetchBodyTypes = createAutocompleteFetcher("body-types")

const CreateGenerationPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")

  const { data: treeData } = useQuery({
    queryKey: ["admin-vehicles-tree"],
    queryFn: async () => {
      const r = await fetch("/admin/vehicle-fitment/tree", { credentials: "include" })
      return r.json() as Promise<{ brands: TreeBrand[] }>
    },
  })

  const initialModelId = searchParams.get("vehicle_model_id") ?? ""

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateGenerationInput>({
    resolver: zodResolver(createGenerationSchema),
    defaultValues: {
      vehicle_model_id: initialModelId,
      code: "",
      name: "",
      year_from: new Date().getFullYear() - 10,
      year_to: null,
      body_type: null,
    },
  })

  // If pre-filled from query string, derive the brand
  if (!selectedBrandId && initialModelId && treeData) {
    const found = treeData.brands.find((b) => b.models.some((m) => m.id === initialModelId))
    if (found) setSelectedBrandId(found.id)
  }

  const availableModels = selectedBrandId
    ? (treeData?.brands.find((b) => b.id === selectedBrandId)?.models ?? [])
    : []

  const onSubmit = async (values: CreateGenerationInput) => {
    setSubmitting(true)
    try {
      const r = await fetch("/admin/vehicle-fitment/generations", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!r.ok) {
        const body = (await r.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${r.status}`)
      }
      toast.success("Generacja utworzona")
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
        <Heading level="h1">Nowa generacja pojazdu</Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 px-6 py-6">
        <Field label="Marka" required>
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <Select.Trigger><Select.Value placeholder="Najpierw wybierz markę..." /></Select.Trigger>
            <Select.Content>
              {(treeData?.brands ?? []).map((b) => (
                <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Field>
        <Field label="Model" error={errors.vehicle_model_id?.message} required>
          <Controller
            control={control}
            name="vehicle_model_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedBrandId}
              >
                <Select.Trigger>
                  <Select.Value placeholder={selectedBrandId ? "Wybierz model..." : "(najpierw marka)"} />
                </Select.Trigger>
                <Select.Content>
                  {availableModels.map((m) => (
                    <Select.Item key={m.id} value={m.id}>{m.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
        </Field>
        <Field label="Code (slug)" error={errors.code?.message} required>
          <Input {...register("code")} placeholder="np. octavia-3" />
        </Field>
        <Field label="Nazwa" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="np. Octavia 3" />
        </Field>
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
          <Button type="submit" isLoading={submitting}>Dodaj generację</Button>
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
export default CreateGenerationPage
