import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CommitmentView = lazy(() => import("./views/CommitmentView"));

export const commitmentRoutes: RouteObject[] = [{ index: true, element: <CommitmentView /> }];
