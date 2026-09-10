import { useId, useState } from "react";
import type { ReactNode } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import type { FormFieldProps } from "../../schema/login-form-schema";
import Button from "../Button";
import "./form-zod.css";

interface FormZodProps<T extends z.ZodType<unknown, FieldValues>> {
  schema: T;
  fields: FormFieldProps<z.input<T>>[];
  defaultValues?: DefaultValues<z.core.input<T>>;
  action: (data: z.output<T>) => void;
  submitLabel?: string;
  submittingLabel?: string;
  statusSlot?: ReactNode;
}

interface PasswordInputProps {
  id: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  invalid: boolean;
  describedBy?: string;
}

function PasswordInput({
  id,
  registration,
  placeholder,
  disabled,
  autoComplete,
  invalid,
  describedBy,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fz-password-wrap">
      <input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...registration}
      />
      <button
        type="button"
        className="fz-password-toggle"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Nascondi password" : "Mostra password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

const FormZod = <T extends z.ZodType<unknown, FieldValues>>({
  schema,
  fields,
  defaultValues,
  action,
  submitLabel = "Invia",
  submittingLabel = "Invio in corso...",
  statusSlot,
}: FormZodProps<T>) => {
  const formId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<T>, unknown, z.output<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<z.input<T>> | undefined,
  });

  const renderInput = (field: FormFieldProps<z.input<T>>) => {
    const fieldId = `${formId}-${String(field.name)}`;
    const errorId = `${fieldId}-error`;
    const isInvalid = Boolean(errors[field.name]);

    switch (field.type) {
      case "password":
        return (
          <PasswordInput
            id={fieldId}
            registration={register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            autoComplete={field.autoComplete}
            invalid={isInvalid}
            describedBy={isInvalid ? errorId : undefined}
          />
        );

      case "textarea":
        return (
          <textarea
            id={fieldId}
            {...register(field.name)}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            disabled={field.disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
          />
        );

      case "select":
        return (
          <select
            id={fieldId}
            {...register(field.name)}
            multiple={field.multiple}
            disabled={field.disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
          >
            {!field.multiple && <option value="">-- seleziona --</option>}
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.text}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="fz-option-group">
            {field.options.map((opt) => (
              <label key={opt.value} className="fz-option">
                <input
                  type="radio"
                  value={opt.value}
                  disabled={field.disabled}
                  {...register(field.name)}
                />
                {opt.text}
              </label>
            ))}
          </div>
        );

      case "checkbox-group":
        return (
          <div className="fz-option-group">
            {field.options.map((opt) => (
              <label key={opt.value} className="fz-option">
                <input
                  type="checkbox"
                  value={opt.value}
                  disabled={field.disabled}
                  {...register(field.name)}
                />
                {opt.text}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <input
            id={fieldId}
            type="checkbox"
            disabled={field.disabled}
            {...register(field.name)}
          />
        );

      default:
        return (
          <input
            id={fieldId}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            disabled={field.disabled}
            autoComplete={field.autoComplete}
            min={field.min}
            max={field.max}
            step={field.step}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
            {...register(field.name)}
          />
        );
    }
  };

  return (
    <form className="fz-form" onSubmit={handleSubmit(action)} noValidate>
      {fields.map((field) => {
        const fieldId = `${formId}-${String(field.name)}`;
        const errorId = `${fieldId}-error`;
        const errorMessage = errors[field.name]?.message as string | undefined;

        return (
          <div className="fz-field" key={String(field.name)}>
            <label className="fz-label" htmlFor={fieldId}>
              {field.label ?? String(field.name)}
            </label>
            {renderInput(field)}
            <div className="fz-note">
              {errorMessage ? (
                <p className="fz-error" id={errorId}>
                  {errorMessage}
                </p>
              ) : (
                field.hint && <p className="fz-hint">{field.hint}</p>
              )}
            </div>
          </div>
        );
      })}

      <div className="fz-status" aria-live="polite">
        {statusSlot}
      </div>

      <Button disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
};

export default FormZod;
