import { useEffect } from "react";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { requireUserSession } from "~/utils/session.server";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?url";
import { UserProvider } from "~/context/UserContext"; // User Context Provider

import "./tailwind.css"; // Ensure Tailwind is available
import Footer from "~/components/Footer"; // Custom Footer component

// CoreUI & Bootstrap CSS
import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "~/components/Navbar";

const prisma = new PrismaClient();

// **Loader to fetch user data**
export const loader: LoaderFunction = async ({ request }) => {
    try {
        const userId = await requireUserSession(request);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        return json({ user: user || null });
    } catch (error) {
        return json({ user: null });
    }
};

// Define links for stylesheets and fonts
export const links: LinksFunction = () => [
    { rel: "stylesheet", href: bootstrapStyles }, // Bootstrap CSS
    { rel: "preconnect", href: "https://fonts.googleapis.com" }, // Google Fonts preconnect
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
    },
];

export default function App() {
    const { user } = useLoaderData<typeof loader>(); // Get user data

    useEffect(() => {
        // Dynamically import CoreUI JavaScript on client-side only
        if (typeof window !== "undefined") {
            import("@coreui/coreui/dist/js/coreui.bundle.min.js").catch((err) =>
                console.error("CoreUI JS failed to load:", err)
            );
        }
    }, []);

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body className="flex flex-col min-h-screen">
        <UserProvider user={user}>
            <Navbar />
            <Outlet />
        </UserProvider>

        {/* Footer at the bottom */}
        <Footer />

        {/* Remix scripts */}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}
