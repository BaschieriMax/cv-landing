import { Loader } from "lucide-react";
import { Suspense } from "react";

export const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <div className="auth-layout-status">
        <Loader />
      </div>
    }
  >
    <Component />
  </Suspense>
);
