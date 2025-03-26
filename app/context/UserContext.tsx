import { createContext, useContext, ReactNode } from "react";

// Define the shape of the user object (replace with actual user structure)
interface User {
    id: string;
    name: string;
    email: string;
    role?: string; // Role can be optional
}

// Context default value (helps avoid null-related errors)
const UserContext = createContext<User | null>(null);

interface UserProviderProps {
    user: User | null;
    children: ReactNode;
}

/**
 * Provides the authenticated user to the entire application.
 */
export function UserProvider({ user, children }: UserProviderProps) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to access user data from context.
 */
export function useUser() {
    const user = useContext(UserContext);

    if (!user) {
        console.warn("useUser() called outside of a UserProvider.");
    }

    return user;
}
