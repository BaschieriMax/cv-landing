import { createBrowserRouter } from "react-router";
import { withSuspense } from "./with-suspense";
import { HomePageLazy, NotFoundLazy, QuestionarioLazy } from "./lazy-pages";
import AuthLayout from "../layouts/AuthLayout";
import RouteError from "../pages/route-error";

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(HomePageLazy),
    errorElement: <RouteError />,
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/questionario",
        element: withSuspense(QuestionarioLazy),
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(NotFoundLazy),
  },
]);
