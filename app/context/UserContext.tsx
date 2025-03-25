import { createContext, useContext } from "react";
import { useLoaderData } from "@remix-run/react";

// Create context
const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
    const { userId } = useLoaderData() || {}; // ✅ Ensure no error when data is null

    return (
        <UserContext.Provider value={{ userId }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook
export const useUser = () => {
    return useContext(UserContext);
};
