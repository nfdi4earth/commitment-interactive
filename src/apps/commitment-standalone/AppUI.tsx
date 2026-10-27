import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { routes } from "@os4a/routes/routes";

// BASE_URL is the deployment's sub-path (vite.config.ts, BASE_PATH), e.g. on GitHub Pages
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export function AppUI() {
    return (
        <Suspense
            fallback={
                <Center width="100vw" height="100vh">
                    <Spinner borderWidth="4px" size="xl" color="blue.500" />
                </Center>
            }
        >
            <RouterProvider router={router} />
        </Suspense>
    );
}
