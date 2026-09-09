import { lazy } from "react";

export const HomePageLazy = lazy(() => import("../pages/homepage"));
export const QuestionarioLazy = lazy(() => import("../pages/questionario"));
export const NotFoundLazy = lazy(() => import("../pages/not-found"));
