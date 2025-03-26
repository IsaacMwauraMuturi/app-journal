import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔐 Session Secret (Ensure it's set in environment variables)
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required in environment variables.");
}

// 🍪 Cookie Session Storage
const storage = createCookieSessionStorage({
    cookie: {
        name: "my-session",
        secure: process.env.NODE_ENV === "production", // Secure only in production
        secrets: [sessionSecret], // Secret for signing the cookie
        sameSite: "lax", // Prevent CSRF attacks
        maxAge: 60 * 60 * 24 * 7, // 1 week expiration
        httpOnly: true, // Prevent client-side access
    },
});

/**
 * Retrieves the session from the request's cookies.
 */
export async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return storage.getSession(cookie);
}

/**
 * Ensures the user is logged in by checking session.
 * Redirects to login page if not authenticated.
 */
export async function requireUserSession(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");

    if (!userId) {
        throw redirect("/login");
    }
    return userId;
}

/**
 * Ensures the user is an Admin.
 * Throws an unauthorized response if the role is not "Admin".
 */
export async function requireAdminSession(request: Request) {
    const userId = await requireUserSession(request);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: { select: { name: true } } },
    });

    if (!user || user.role.name !== "Admin") {
        throw new Response("Unauthorized", { status: 401 });
    }

    return userId;
}

/**
 * Sets a session with the user's ID.
 */
export async function setSession(request: Request, userId: string) {
    const session = await getSession(request);
    session.set("userId", userId);
    return storage.commitSession(session);
}

/**
 * Destroys the current user session.
 */
export async function destroySession(request: Request) {
    const session = await getSession(request);
    return storage.destroySession(session);
}
