import type { Path } from "react-hook-form";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(6, "Minimo 6 caratteri"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Nome troppo corto"),
    email: z.email("Email non valida"),
    password: z.string().min(6, "Minimo 6 caratteri"),
    confirmPassword: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export interface ListItem {
  text: string;
  value: string;
}

interface BaseField<T> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export type FormFieldProps<T> =
  // input "semplici" nativi
  | (BaseField<T> & {
      type?:
        | "text"
        | "email"
        | "password"
        | "number"
        | "tel"
        | "url"
        | "date"
        | "time"
        | "datetime-local"
        | "month"
        | "week"
        | "color"
        | "range"
        | "file";
      min?: number;
      max?: number;
      step?: number;
    })
  // area di testo
  | (BaseField<T> & {
      type: "textarea";
      rows?: number;
    })
  // checkbox singolo (boolean)
  | (BaseField<T> & {
      type: "checkbox";
    })
  // dropdown singola / multipla
  | (BaseField<T> & {
      type: "select";
      options: ListItem[];
      multiple?: boolean;
    })
  // radio button
  | (BaseField<T> & {
      type: "radio";
      options: ListItem[];
    })
  // gruppo di checkbox (risultato: array di value)
  | (BaseField<T> & {
      type: "checkbox-group";
      options: ListItem[];
    });
