import { useEffect } from "react";
import { Outlet } from "react-router";
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
          <LoginFormZod />
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
