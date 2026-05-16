import { Button, Heading, Input, Label, Select, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useState } from "react"
import { createStandaloneWiringSchema, type CreateStandaloneWiringInput } from "../../../../validators/standalone-wiring"
import { TextAutocomplete } from "../../../components/text-autocomplete"
import { createAutocompleteFetcher } from "../../../components/text-autocomplete/fetchers"

export type StandaloneWiringFormProps = {
  defaultValues?: Partial<CreateStandaloneWiringInput>
  onSubmit: (values: CreateStandaloneWiringInput) => Promise<void>
  submitLabel: string
  onCancel?: () => void
}

const EMPTY: CreateStandaloneWiringInput = {
  catalog_number: "",
  name: "",
  manufacturer: "",
  type: "module",
  pin_count: 13,
  weight_kg: 2,
  has_fog_lights: false,
  has_reverse_lights: false,
  has_stop_lights: false,
  has_indicators: false,
  homologation: "",
  warranty_years: 2,
  fits_all_vehicles: false,
  description_html: "",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null,
}

const fetchManufacturers = createAutocompleteFetcher("manufacturers")
const fetchHomologations = createAutocompleteFetcher("homologations")

const FUNCTION_FIELDS: Array<{ name: keyof CreateStandaloneWiringInput; label: string }> = [
  { name: "has_fog_lights", label: "Światła przeciwmgielne" },
  { name: "has_reverse_lights", label: "Światła cofania" },
  { name: "has_stop_lights", label: "Światła stop" },
  { name: "has_indicators", label: "Kierunkowskazy" },
]

export const StandaloneWiringForm = ({ defaultValues, onSubmit, submitLabel, onCancel }: StandaloneWiringFormProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [galleryText, setGalleryText] = useState((defaultValues?.gallery ?? []).join("\n"))

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<CreateStandaloneWiringInput>({
    resolver: zodResolver(createStandaloneWiringSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  })

  const onSubmitInternal = async (values: CreateStandaloneWiringInput) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd zapisu")
    } finally {
      setSubmitting(false)
    }
  }

  const errorText = (field: keyof CreateStandaloneWiringInput): string | null => {
    const m = errors[field]?.message
    return typeof m === "string" ? m : null
  }

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="flex flex-col gap-y-6">
      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Identyfikacja</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nr katalogowy" required error={errorText("catalog_number")}>
            <Input {...register("catalog_number")} placeholder="np. MOD-13-UNI-01" />
          </FormField>
          <FormField label="Nazwa" required error={errorText("name")}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Producent" required error={errorText("manufacturer")}>
            <Controller
              control={control}
              name="manufacturer"
              render={({ field }) => (
                <TextAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fetchSuggestions={fetchManufacturers}
                />
              )}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Charakterystyka elektryczna</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Typ" required error={errorText("type")}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="harness">Wiązka (harness)</Select.Item>
                    <Select.Item value="module">Moduł (module)</Select.Item>
                  </Select.Content>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Pin count" required error={errorText("pin_count")}>
            <Controller
              control={control}
              name="pin_count"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="7">7-pin</Select.Item>
                    <Select.Item value="13">13-pin</Select.Item>
                  </Select.Content>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Homologacja" required error={errorText("homologation")}>
            <Controller
              control={control}
              name="homologation"
              render={({ field }) => (
                <TextAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fetchSuggestions={fetchHomologations}
                />
              )}
            />
          </FormField>
          <FormField label="Waga (kg)" required error={errorText("weight_kg")}>
            <Input type="number" min={0} step={1} {...register("weight_kg", { valueAsNumber: true })} />
          </FormField>
        </div>

        <Controller
          control={control}
          name="fits_all_vehicles"
          render={({ field }) => (
            <div className="rounded-md border-2 border-ui-border-base bg-ui-bg-subtle p-3">
              <div className="flex items-center gap-x-3">
                <Switch
                  id="fits_all_vehicles"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <div>
                  <Label htmlFor="fits_all_vehicles" className="font-medium">
                    Pasuje do wszystkich aut (uniwersalna)
                  </Label>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {field.value
                      ? "Workflow utworzy 1 produkt uniwersalny bez fitmentu do auta."
                      : "Workflow wymaga wybrania konkretnych generacji przy wystawianiu."}
                  </Text>
                </div>
              </div>
            </div>
          )}
        />

        <div>
          <Label className="text-ui-fg-subtle">Funkcje elektryczne</Label>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FUNCTION_FIELDS.map((f) => (
              <Controller
                key={f.name}
                control={control}
                name={f.name}
                render={({ field }) => (
                  <div className="flex items-center gap-x-2">
                    <Switch id={f.name} checked={field.value as boolean} onCheckedChange={field.onChange} />
                    <Label htmlFor={f.name} size="small">{f.label}</Label>
                  </div>
                )}
              />
            ))}
          </div>
        </div>

        <FormField label="Gwarancja (lata)" required error={errorText("warranty_years")}>
          <Input type="number" min={0} max={20} step={1} {...register("warranty_years", { valueAsNumber: true })} />
        </FormField>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Opis</Heading>
        <FormField label="Opis HTML" required error={errorText("description_html")}>
          <Textarea rows={6} {...register("description_html")} />
        </FormField>
        <FormField label="Krótki opis" error={errorText("short_description")}>
          <Textarea rows={2} {...register("short_description")} />
        </FormField>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Media</Heading>
        <FormField label="Thumbnail URL" required error={errorText("thumbnail")}>
          <Input {...register("thumbnail")} />
        </FormField>
        <FormField label="Galeria (jeden URL w linii)" error={errorText("gallery")}>
          <Textarea
            rows={4}
            value={galleryText}
            onChange={(e) => {
              setGalleryText(e.target.value)
              const urls = e.target.value.split("\n").map((s) => s.trim()).filter((s) => s.length > 0)
              setValue("gallery", urls, { shouldValidate: true })
            }}
          />
        </FormField>
        <FormField label="URL instrukcji montażu (PDF)" error={errorText("installation_manual_url")}>
          <Input {...register("installation_manual_url")} />
        </FormField>
      </section>

      <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Anuluj</Button>
        )}
        <Button type="submit" isLoading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

type FormFieldProps = { label: string; required?: boolean; error?: string | null; children: React.ReactNode }
const FormField = ({ label, required, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-y-1">
    <Label className="text-ui-fg-subtle">{label} {required && <span className="text-ui-fg-error">*</span>}</Label>
    {children}
    {error && <Text size="xsmall" className="text-ui-fg-error">{error}</Text>}
  </div>
)
