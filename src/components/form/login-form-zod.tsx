import { useState } from "react";
import {
  loginSchema,
  signupSchema,
  type FormFieldProps,
  type LoginFormValues,
  type SignupFormValues,
} from "../../schema/login-form-schema";
import { useAuthStore } from "../../store/auth";
import { translateAuthError } from "../../utils/auth-errors";

import FormZod from "./form-zod";
import "./login-form-zod.css";
import Button from "../Button";

const loginFields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "current-password",
  },
] satisfies FormFieldProps<LoginFormValues>[];

const signupFields = [
  { name: "name", label: "Nome", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Conferma password",
    type: "password",
    autoComplete: "new-password",
  },
] satisfies FormFieldProps<SignupFormValues>[];

type Mode = "login" | "signup";

const LoginFormZod = () => {
  const { login, signup } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onLogin = async (data: LoginFormValues) => {
    setError(null);
    setInfo(null);
    const { error } = await login({
      email: data.email.trim(),
      password: data.password,
    });
    if (error) setError(translateAuthError(error));
  };

  const onSignup = async (data: SignupFormValues) => {
    setError(null);
    setInfo(null);
    const { error, needsConfirmation } = await signup({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    if (error) {
      setError(translateAuthError(error));
      return;
    }
    if (needsConfirmation) {
      setInfo(
        "Registrazione completata. Controlla la tua email per confermare l'account, poi accedi.",
      );
      setMode("login");
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
    setInfo(null);
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form-title">
        {mode === "login" ? "Accedi" : "Crea un account"}
      </h2>

      {mode === "login" ? (
        <FormZod
          key="login"
          fields={loginFields}
          schema={loginSchema}
          action={onLogin}
          submitLabel="Accedi"
          submittingLabel="Accesso in corso..."
        />
      ) : (
        <FormZod
          key="signup"
          fields={signupFields}
          schema={signupSchema}
          action={onSignup}
          submitLabel="Crea account"
          submittingLabel="Registrazione in corso..."
        />
      )}

      {error && (
        <p className="auth-form-message auth-form-message-error">{error}</p>
      )}
      {info && (
        <p className="auth-form-message auth-form-message-info">{info}</p>
      )}

      <Button type="button" className="auth-form-toggle" onClick={toggleMode}>
        {mode === "login"
          ? "Non hai un account? Registrati"
          : "Hai già un account? Accedi"}
      </Button>
    </div>
  );
};

export default LoginFormZod;
