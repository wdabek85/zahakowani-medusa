import { Button, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useState } from "react"
import { createHookSchema, type CreateHookInput } from "../../../../validators/hook"
import { TextAutocomplete } from "../../../components/text-autocomplete"
import { createAutocompleteFetcher } from "../../../components/text-autocomplete/fetchers"

export type HookFormProps = {
  defaultValues?: Partial<CreateHookInput>
  onSubmit: (values: CreateHookInput) => Promise<void>
  submitLabel: string
  onCancel?: () => void
}

const EMPTY_DEFAULTS: CreateHookInput = {
  catalog_number: "",
  name: "",
  manufacturer: "",
  manufacturer_catalog_number: null,
  pulling_capacity_kg: 0,
  vertical_load_kg: 0,
  homologation: "",
  ball_type: "",
  requires_bumper_cutting: false,
  warranty_years: 2,
  weight_kg: 0,
  description_html: "",
  short_description: null,
  thumbnail: "",
  gallery: [],
  installation_manual_url: null,
  certificate_url: null,
}

const fetchManufacturers = createAutocompleteFetcher("manufacturers")
const fetchHomologations = createAutocompleteFetcher("homologations")
const fetchBallTypes = createAutocompleteFetcher("ball-types")

export const HookForm = ({ defaultValues, onSubmit, submitLabel, onCancel }: HookFormProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [galleryText, setGalleryText] = useState(
    (defaultValues?.gallery ?? []).join("\n"),
  )

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<CreateHookInput>({
    resolver: zodResolver(createHookSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  })

  const onSubmitInternal = async (values: CreateHookInput) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd zapisu haka")
    } finally {
      setSubmitting(false)
    }
  }

  const errorText = (field: keyof CreateHookInput): string | null => {
    const message = errors[field]?.message
    return typeof message === "string" ? message : null
  }

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="flex flex-col gap-y-6">
      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Identyfikacja</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nr katalogowy" required error={errorText("catalog_number")}>
            <Input {...register("catalog_number")} placeholder="np. Z/016" />
          </FormField>
          <FormField label="Nazwa wewnętrzna" required error={errorText("name")}>
            <Input {...register("name")} placeholder="np. Hak Skoda Octavia 3" />
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
                  placeholder="Imioła Hak-Pol"
                />
              )}
            />
          </FormField>
          <FormField label="Nr katalogowy producenta" error={errorText("manufacturer_catalog_number")}>
            <Input {...register("manufacturer_catalog_number")} placeholder="opcjonalnie" />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Parametry techniczne</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Uciąg (kg)" required error={errorText("pulling_capacity_kg")}>
            <Input
              type="number"
              min={0}
              step={1}
              {...register("pulling_capacity_kg", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Nacisk pionowy (kg)" required error={errorText("vertical_load_kg")}>
            <Input
              type="number"
              min={0}
              step={1}
              {...register("vertical_load_kg", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Waga haka (kg)" required error={errorText("weight_kg")}>
            <Input
              type="number"
              min={0}
              step={1}
              {...register("weight_kg", { valueAsNumber: true })}
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
                  placeholder="np. E20"
                />
              )}
            />
          </FormField>
          <FormField label="Typ kuli" required error={errorText("ball_type")}>
            <Controller
              control={control}
              name="ball_type"
              render={({ field }) => (
                <TextAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fetchSuggestions={fetchBallTypes}
                  placeholder="np. Odkręcana"
                />
              )}
            />
          </FormField>
          <FormField label="Gwarancja (lata)" required error={errorText("warranty_years")}>
            <Input
              type="number"
              min={0}
              max={20}
              step={1}
              {...register("warranty_years", { valueAsNumber: true })}
            />
          </FormField>
        </div>
        <Controller
          control={control}
          name="requires_bumper_cutting"
          render={({ field }) => (
            <div className="flex items-center gap-x-3">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="requires_bumper_cutting"
              />
              <Label htmlFor="requires_bumper_cutting">Wymaga cięcia zderzaka</Label>
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Opis</Heading>
        <FormField label="Opis HTML (główny)" required error={errorText("description_html")}>
          <Textarea
            rows={6}
            {...register("description_html")}
            placeholder="<p>Pełny opis haka...</p>"
          />
        </FormField>
        <FormField label="Krótki opis" error={errorText("short_description")}>
          <Textarea
            rows={2}
            {...register("short_description")}
            placeholder="opcjonalnie, używany w listingu"
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h3">Media</Heading>
        <FormField label="Thumbnail URL" required error={errorText("thumbnail")}>
          <Input {...register("thumbnail")} placeholder="https://..." />
        </FormField>
        <FormField label="Galeria (jeden URL w linii)" error={errorText("gallery")}>
          <Textarea
            rows={4}
            value={galleryText}
            onChange={(e) => {
              setGalleryText(e.target.value)
              const urls = e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
              setValue("gallery", urls, { shouldValidate: true })
            }}
            placeholder="https://...&#10;https://..."
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            Każda linia = jeden URL. Walidator wymaga niepustego stringa.
          </Text>
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="URL instrukcji montażu (PDF)" error={errorText("installation_manual_url")}>
            <Input {...register("installation_manual_url")} placeholder="https://..." />
          </FormField>
          <FormField label="URL certyfikatu (PDF)" error={errorText("certificate_url")}>
            <Input {...register("certificate_url")} placeholder="https://..." />
          </FormField>
        </div>
      </section>

      <div className="flex justify-end gap-x-2 border-t border-ui-border-base pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Anuluj
          </Button>
        )}
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
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
