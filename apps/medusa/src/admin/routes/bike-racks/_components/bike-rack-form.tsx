import { Button, Heading, Input, Label, Select, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useState } from "react"
import { createBikeRackSchema, type CreateBikeRackInput } from "../../../../validators/bike-rack"
import { TextAutocomplete } from "../../../components/text-autocomplete"
import { createAutocompleteFetcher } from "../../../components/text-autocomplete/fetchers"

export type BikeRackFormProps = {
  defaultValues?: Partial<CreateBikeRackInput>
  onSubmit: (values: CreateBikeRackInput) => Promise<void>
  submitLabel: string
  onCancel?: () => void
}

const EMPTY: CreateBikeRackInput = {
  catalog_number: "",
  name: "",
  manufacturer: "",
  max_bikes: 1,
  max_bike_weight_kg: 20,
  max_total_load_kg: 50,
  power_socket: "13-pin",
  weight_kg: 0,
  length_cm: 0,
  has_lockable_attachment: false,
  has_rear_lights: false,
  has_tilt_function: false,
  tool_free_assembly: false,
  warranty_years: 2,
  description_html: "",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null,
}

const fetchManufacturers = createAutocompleteFetcher("manufacturers")

const BOOL_FIELDS: Array<{ name: keyof CreateBikeRackInput; label: string }> = [
  { name: "has_lockable_attachment", label: "Zamykany zaczep" },
  { name: "has_rear_lights", label: "Światła tylne" },
  { name: "has_tilt_function", label: "Funkcja odchylania (tilt)" },
  { name: "tool_free_assembly", label: "Montaż bez narzędzi" },
]

export const BikeRackForm = ({ defaultValues, onSubmit, submitLabel, onCancel }: BikeRackFormProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [galleryText, setGalleryText] = useState((defaultValues?.gallery ?? []).join("\n"))

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<CreateBikeRackInput>({
    resolver: zodResolver(createBikeRackSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  })

  const onSubmitInternal = async (values: CreateBikeRackInput) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd zapisu bagażnika")
    } finally {
      setSubmitting(false)
    }
  }

  const errorText = (field: keyof CreateBikeRackInput): string | null => {
    const m = errors[field]?.message
    return typeof m === "string" ? m : null
  }

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="flex flex-col gap-y-6">
      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Identyfikacja</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nr katalogowy" required error={errorText("catalog_number")}>
            <Input {...register("catalog_number")} placeholder="np. BR-2024-01" />
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
        <Heading level="h3">Pojemność i udźwig</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Max liczba rowerów" required error={errorText("max_bikes")}>
            <Input type="number" min={1} step={1} {...register("max_bikes", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Max waga 1 roweru (kg)" required error={errorText("max_bike_weight_kg")}>
            <Input type="number" min={0} step={1} {...register("max_bike_weight_kg", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Max ładowność całkowita (kg)" required error={errorText("max_total_load_kg")}>
            <Input type="number" min={0} step={1} {...register("max_total_load_kg", { valueAsNumber: true })} />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Parametry techniczne</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Gniazdo elektryczne" required error={errorText("power_socket")}>
            <Controller
              control={control}
              name="power_socket"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Wybierz..." />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="7-pin">7-pin</Select.Item>
                    <Select.Item value="13-pin">13-pin</Select.Item>
                  </Select.Content>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Waga bagażnika (kg)" required error={errorText("weight_kg")}>
            <Input type="number" min={0} step={1} {...register("weight_kg", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Długość (cm)" required error={errorText("length_cm")}>
            <Input type="number" min={0} step={1} {...register("length_cm", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Gwarancja (lata)" required error={errorText("warranty_years")}>
            <Input type="number" min={0} max={20} step={1} {...register("warranty_years", { valueAsNumber: true })} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BOOL_FIELDS.map((f) => (
            <Controller
              key={f.name}
              control={control}
              name={f.name}
              render={({ field }) => (
                <div className="flex items-center gap-x-3">
                  <Switch
                    id={f.name}
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor={f.name}>{f.label}</Label>
                </div>
              )}
            />
          ))}
        </div>
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
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Anuluj
          </Button>
        )}
        <Button type="submit" isLoading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

type FormFieldProps = {
  label: string
  required?: boolean
  error?: string | null
  children: React.ReactNode
}

const FormField = ({ label, required, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-y-1">
    <Label className="text-ui-fg-subtle">
      {label} {required && <span className="text-ui-fg-error">*</span>}
    </Label>
    {children}
    {error && <Text size="xsmall" className="text-ui-fg-error">{error}</Text>}
  </div>
)
