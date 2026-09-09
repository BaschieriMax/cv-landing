import { useEffect } from "react";
import { Link, Outlet } from "react-router";
import { useAuthStore } from "../store/auth";
import LoginFormZod from "../components/form/login-form-zod";
import "./AuthLayout.css";

const AuthLayout = () => {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = useAuthStore.getState().hydrate();
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="auth-layout-status">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-layout-gate">
        <div className="auth-layout-gate-inner">
          <p className="auth-layout-gate-sub">
            Serve un account per compilare il questionario.
          </p>
          <LoginFormZod />
          <Link className="auth-layout-back" to="/">
            ← Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
