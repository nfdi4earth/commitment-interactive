import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { commitmentRoutes } from "commitment";

const Layout = lazy(() => import("@os4a/layouts/layout"));

// The commitment package brings its own (relative) routes and is mounted under /commitment,
// the same path it will have inside OneStop4All.
export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Navigate to="/commitment" replace /> },
            { path: "commitment", children: commitmentRoutes },
            { path: "*", element: <Navigate to="/commitment" replace /> }
        ]
    }
];
