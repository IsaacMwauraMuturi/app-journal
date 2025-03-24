import { json, LoaderFunction } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server"; // Import session utility
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "react-router";
import { useNavigate } from "@remix-run/react";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import {useState} from "react";

const prisma = new PrismaClient();
// loader to fetch user profile data
export let loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserSession(request);

    // Fetch user data from your database (Prisma or other ORM)
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return json({ user });
};

// Inside the component:
export default function Dashboard() {
    const { user } = useLoaderData(); // Fetch the user data from the loader
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (response.ok) {
            navigate("/login"); // Redirect to login after logout
        } else {
            console.error("Logout failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                    <nav className="mt-6">
                        <a href="#" className="block py-2 text-gray-700 hover:bg-gray-200 rounded">Home</a>
                        <a href="#" className="block py-2 text-gray-700 hover:bg-gray-200 rounded">Profile</a>
                        <a href="#" className="block py-2 text-gray-700 hover:bg-gray-200 rounded">Settings</a>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                        <FaBars className="text-gray-800" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                    <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-600">
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 p-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-700">Email: {user?.email}</p>
                        {/* Add other user-specific content */}
                    </div>
                </main>
            </div>
        </div>
    );
}