import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css?url";
import { UserProvider } from "~/context/UserContext"; // Import the User Context Provider

import "./tailwind.css"; // Ensure this file exists
import Footer from "~/components/Footer"; // Your custom Footer component

// Define links for stylesheets and fonts
export const links: LinksFunction = () => [
    { rel: "stylesheet", href: bootstrapStyles }, // Bootstrap CSS
    { rel: "preconnect", href: "https://fonts.googleapis.com" }, // Google Fonts preconnect
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous", // Required for Google Fonts
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap", // Inter font
    },
];

export default function App() {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body className="flex flex-col min-h-screen">
        <UserProvider> {/* Wrap around Outlet instead of using children */}
            {/* Main content */}
            <div className="flex-1">
                <Outlet /> {/* Render the current route */}
            </div>
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
