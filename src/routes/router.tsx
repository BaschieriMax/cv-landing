import { createBrowserRouter } from "react-router";
import { withSuspense } from "./with-suspense";
import { HomePageLazy, NotFoundLazy, QuestionarioLazy } from "./lazy-pages";
import RouteError from "../pages/route-error";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: withSuspense(HomePageLazy),
      errorElement: <RouteError />,
    },
    {
      path: "/questionario",
      element: withSuspense(QuestionarioLazy),
      errorElement: <RouteError />,
    },
    {
      path: "*",
      element: withSuspense(NotFoundLazy),
    },
  ],
  {
    // Su Netlify BASE_URL è "/" (nessun effetto). Su GitHub Pages, buildato
    // con "vite build --base=/cv-landing/", vale "/cv-landing/": serve per
    // far combaciare le route con l'URL reale del sotto-percorso.
    basename: import.meta.env.BASE_URL,
  }
);
