import { json, LoaderFunction } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server"; // Import session utility
import { PrismaClient } from "@prisma/client";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { FaBars, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";

const prisma = new PrismaClient();

// Loader to fetch user profile data
export let loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserSession(request);

    // Fetch user data from your database (Prisma or other ORM)
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Fetch journal entries for the user
    const entries = await prisma.Journal.findMany({
        where: { userId },
    });

    return json({ user, entries });
};

export default function Dashboard() {
    const { user, entries } = useLoaderData(); // Fetch user and entries data from the loader
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ title: "", content: "", category: "", date: "" });
    const [editEntry, setEditEntry] = useState(null);
    const [currentEntries, setCurrentEntries] = useState(entries);

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

    const handleAddEntry = async () => {
        const response = await fetch("/api/entries/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEntry),
        });

        if (response.ok) {
            const data = await response.json();
            setCurrentEntries([...currentEntries, data]);
            setNewEntry({ title: "", content: "", category: "", date: "" }); // Reset form
        }
    };

    const handleEditEntry = async (id, updatedEntry) => {
        const response = await fetch(`/api/entries/${id}/edit`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEntry),
        });

        if (response.ok) {
            const data = await response.json();
            setCurrentEntries(currentEntries.map((entry) => (entry.id === id ? data : entry)));
            setEditEntry(null); // Reset edit mode
        }
    };

    const handleDeleteEntry = async (id) => {
        const response = await fetch(`/api/entries/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            setCurrentEntries(currentEntries.filter((entry) => entry.id !== id));
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}


            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Header */}
                <header className="bg-white shadow p-3 d-flex justify-content-between align-items-center">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-light d-lg-none">
                        <FaBars />
                    </button>
                    <h1 className="h4 fw-bold mb-0">Welcome, {user?.name}!</h1>
                    <button onClick={handleLogout} className="btn btn-danger d-flex align-items-center">
                        <FaSignOutAlt className="me-2" />
                        Logout
                    </button>
                </header>

                {/* Content */}
                <main className="flex-grow-1 p-4">
                    {/* Journal Entry Management */}
                    <div className="mb-4">
                        <h2 className="h5 fw-bold mb-3">Journal Entries</h2>
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Title"
                                value={newEntry.title}
                                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                className="form-control mb-2"
                            />
                            <textarea
                                placeholder="Content"
                                value={newEntry.content}
                                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                className="form-control mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={newEntry.category}
                                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                className="form-control mb-2"
                            />
                            <input
                                type="date"
                                value={newEntry.date}
                                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                className="form-control mb-2"
                            />
                            <button onClick={handleAddEntry} className="btn btn-primary">
                                <FaPlus className="me-2" />
                                Add Entry
                            </button>
                        </div>
                        <div className="list-group">
                            {currentEntries.map((entry) => (
                                <div key={entry.id} className="list-group-item">
                                    <h3 className="h6 fw-bold">{entry.title}</h3>
                                    <p>{entry.content}</p>
                                    <small className="text-muted">{entry.category} | {entry.date}</small>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => setEditEntry(entry)}
                                            className="btn btn-sm btn-warning me-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary View */}
                    <div className="mb-4">
                        <h2 className="h5 fw-bold mb-3">Summary</h2>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h3 className="h6 fw-bold">Entry Frequency</h3>
                                        {/* Add a calendar heatmap here */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h3 className="h6 fw-bold">Category Distribution</h3>
                                        {/* Add a pie chart or bar graph here */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}