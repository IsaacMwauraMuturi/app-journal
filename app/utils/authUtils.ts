import jwt from "jsonwebtoken";
import { json } from "@remix-run/node";

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

// Function to check if the user is authenticated by verifying JWT
export const isAuthenticated = (request: Request): boolean => {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) return false;

    try {
        jwt.verify(token, JWT_SECRET); // Verifying the JWT token
        return true;
    } catch (error) {
        console.error("Invalid token:", error);
        return false;
    }
};

// Function to restrict access for unauthenticated users
export const requireAuth = async (request: Request) => {
    if (!isAuthenticated(request)) {
        return json(
            { error: "Unauthorized. Please log in." },
            { status: 401 }
        );
    }
    return null; // If user is authenticated, return nothing
};

// Function to check if the user is logged in, and restrict non-authenticated users
export const redirectIfAuthenticated = (request: Request, redirectTo: string = "/dashboard") => {
    if (isAuthenticated(request)) {
        return json(
            { message: "Redirecting to dashboard" },
            { status: 302, headers: { Location: redirectTo } }
        );
    }
    return null; // If user is not authenticated, return nothing
};
