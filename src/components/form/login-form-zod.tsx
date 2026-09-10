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
    hint: "Minimo 6 caratteri",
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

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const statusMessage = error ? (
    <p className="auth-status auth-status-error">{error}</p>
  ) : info ? (
    <p className="auth-status auth-status-info">{info}</p>
  ) : null;

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab${mode === "login" ? " active" : ""}`}
          onClick={() => switchMode("login")}
        >
          Accedi
        </button>
        <button
          type="button"
          className={`auth-tab${mode === "signup" ? " active" : ""}`}
          onClick={() => switchMode("signup")}
        >
          Registrati
        </button>
      </div>

      <div className="auth-card-head">
        <h2>{mode === "login" ? "Accedi" : "Crea un account"}</h2>
        <p>
          {mode === "login"
            ? "Serve un account per compilare il questionario."
            : "Bastano nome, email e una password: due minuti e sei dentro."}
        </p>
      </div>

      {mode === "login" ? (
        <FormZod
          key="login"
          fields={loginFields}
          schema={loginSchema}
          action={onLogin}
          submitLabel="Accedi"
          submittingLabel="Accesso in corso..."
          statusSlot={statusMessage}
        />
      ) : (
        <FormZod
          key="signup"
          fields={signupFields}
          schema={signupSchema}
          action={onSignup}
          submitLabel="Crea account"
          submittingLabel="Registrazione in corso..."
          statusSlot={statusMessage}
        />
      )}
    </div>
  );
};

export default LoginFormZod;
