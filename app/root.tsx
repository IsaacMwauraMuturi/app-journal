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

// Import styles
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?url";
import "./tailwind.css"; // Ensure Tailwind CSS is available
import "@coreui/coreui/dist/css/coreui.min.css"; // CoreUI CSS
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS

// Import components
import { UserProvider } from "~/context/UserContext"; // User Context Provider
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Loader function to fetch user data.
 * It retrieves the user session and fetches the user's details from the database.
 */
export const loader: LoaderFunction = async ({ request }) => {
    try {
        // Validate user session and get user ID
        const userId = await requireUserSession(request);

        // Fetch user details from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Format user data for easier access in components
        const userWithRole = user
            ? { ...user, role: user.role.name }
            : null;

        return json({ user: userWithRole });
    } catch (error) {
        console.error("Error loading user data:", error);
        return json({ user: null });
    }
};

/**
 * Defines links for stylesheets and fonts.
 * This ensures required styles are properly loaded.
 */
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

/**
 * Root component of the application.
 * Provides a layout with a Navbar, dynamic content (Outlet), and a Footer.
 */
export default function App() {
    // Get user data from the loader
    const { user } = useLoaderData<typeof loader>();

    useEffect(() => {
        // Load CoreUI JavaScript only on the client side
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
            <title>My Journal App</title>
            <Meta />
            <Links />
        </head>
        <body className="flex flex-col min-h-screen">
        {/* Provide user data to the application context */}
        <UserProvider user={user}>
            <Navbar />
            <Outlet />
        </UserProvider>

        {/* Footer positioned at the bottom */}
        <Footer />

        {/* Remix scripts for functionality */}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}
