import { createCookieSessionStorage, redirect } from "@remix-run/node";

// Create a cookie session storage instance
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";
const storage = createCookieSessionStorage({
    cookie: {
        name: "my-session", // Cookie name
        secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
        secrets: [sessionSecret], // Secret to sign the cookie
        sameSite: "lax", // Cookie's SameSite option
        maxAge: 60 * 60 * 24 * 7, // Session expiry in seconds (1 week)
        httpOnly: true, // HttpOnly cookie
    },
});
// export async function isUserLoggedIn(request: Request) {
//     const session = await getSession(request.headers.get("Cookie"));
//     return session.has("userId"); // Adjust this based on how you're storing user sessions
// }
// Get the user session
export async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return storage.getSession(cookie);
}

// Set a session
export async function setSession(request: Request, userId: string) {
    const session = await getSession(request);
    session.set("userId", userId);
    return storage.commitSession(session);
}

// Destroy the session
export async function destroySession(request: Request) {
    const session = await getSession(request);
    return storage.destroySession(session);
}

// Check if the user is logged in
export async function requireUserSession(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");
    if (!userId) {
        throw redirect("/login"); // Redirect to login if no session exists
    }
    return userId;
}
