import { json, LoaderFunction } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { FaBars, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useState } from "react";
import JournalEditForm from "~/components/JournalEditForm";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Navbar from "~/components/Navbar";
// import { WordCloud } from "react-wordcloud";
// import "react-wordcloud/lib/styles.css";

const prisma = new PrismaClient();
Chart.register(...registerables);
const localizer = momentLocalizer(moment);

// Loader to fetch user profile data
export let loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserSession(request);

    // Fetch user data from your database (Prisma or other ORM)
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Fetch journal entries for the user
    const entries = await prisma.journal.findMany({
        where: { userId },
    });

    return json({ user, entries });
};

export default function Dashboard() {
    const { user, entries } = useLoaderData(); // Fetch user and entries data from the loader
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Filter entries based on the selected date range
    const filteredEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
            (!dateRange.start || entryDate >= dateRange.start) &&
            (!dateRange.end || entryDate <= dateRange.end)
        );
    });

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

    // Handle date range change
    const handleDateRangeChange = (start, end) => {
        setDateRange({ start, end });
    };

    // Handle CRUD operations
    const handleAddEntry = async (newEntry) => {
        // Add new entry logic
    };

    const handleEditEntry = async (id, updatedEntry) => {
        // Edit entry logic
    };

    const handleDeleteEntry = async (id) => {
        // Delete entry logic
    };

    // Data for visualizations
    const categoryDistributionData = {
        labels: ["Personal", "Work", "Travel"],
        datasets: [
            {
                data: [30, 50, 20],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    };

    const wordCountTrendsData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Word Count",
                data: [100, 200, 150, 300, 250],
                backgroundColor: "#36A2EB",
            },
        ],
    };

    const wordCloudData = [
        { text: "Happy", value: 100 },
        { text: "Sad", value: 80 },
        { text: "Excited", value: 60 },
        { text: "Angry", value: 40 },
    ];

    return (
        <div className="font-sans bg-gray-50 text-gray-900">

            <div className="d-flex min-vh-100 bg-light">
                {/* Sidebar */}
                // Todo : Remove the header use main nav
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
                        {/* Date Range Selector */}
                        <div className="mb-4">
                            <h2 className="h5 fw-bold mb-3">Filter by Date Range</h2>
                            <input
                                type="date"
                                onChange={(e) => handleDateRangeChange(new Date(e.target.value), dateRange.end)}
                            />
                            <input
                                type="date"
                                onChange={(e) => handleDateRangeChange(dateRange.start, new Date(e.target.value))}
                            />
                        </div>

                        {/* Summary View */}
                        <div className="mb-4">
                            <h2 className="h5 fw-bold mb-3">Summary View</h2>
                            <div className="row">
                                {/* Calendar Heatmap */}
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 className="h6 fw-bold">Entry Frequency</h3>
                                            <Calendar
                                                localizer={localizer}
                                                events={filteredEntries.map((entry) => ({
                                                    title: entry.title,
                                                    start: new Date(entry.date),
                                                    end: new Date(entry.date),
                                                }))}
                                                startAccessor="start"
                                                endAccessor="end"
                                                style={{ height: 300 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category Distribution */}
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 className="h6 fw-bold">Category Distribution</h3>
                                            <Pie data={categoryDistributionData} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Word Count Trends */}
                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 className="h6 fw-bold">Word Count Trends</h3>
                                            <Bar data={wordCountTrendsData} />
                                        </div>
                                    </div>
                                </div>

                                 Word Cloud
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 className="h6 fw-bold">Word Cloud</h3>
                                            {/*<WordCloud words={wordCloudData} />*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="mb-4">
                            <h2 className="h5 fw-bold mb-3">Journal Entries</h2>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{entry.title}</td>
                                        <td>{entry.category}</td>
                                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/journal/${entry.id}/view`)}
                                                className="btn btn-sm btn-info me-2"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditEntry(entry);
                                                    setIsEditModalOpen(true);
                                                }}
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
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <button onClick={() => navigate("/journal/add")}
                                className="btn btn-primary">
                                <FaPlus className="me-2" />
                                Add New Entry
                            </button>
                        </div>
                    </main>
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Journal Entry</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setIsEditModalOpen(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <JournalEditForm
                                        entry={editEntry}
                                        onSubmit={(updatedEntry) => handleEditEntry(editEntry.id, updatedEntry)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}