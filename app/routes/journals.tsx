// app/routes/journals.tsx
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
// import { DeleteJournalButton } from "~/components/delete-journal-button";

const prisma = new PrismaClient();

export async function loader({ request }) {
    await requireUserSession(request);
    return json({});
}

export default function JournalList() {
    const fetcher = useFetcher();
    const [filters, setFilters] = useState({
        search: "",
        categoryId: "",
        mood: "",
        startDate: "",
        endDate: "",
        tag: ""
    });
    const [journals, setJournals] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        moods: []
    });

    // Load initial data
    useEffect(() => {
        fetcher.load("/api/journals");
    }, []);

    // Update data when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }
        fetcher.load(`/api/journals?${params.toString()}`);
    }, [filters]);

    // Update state when data loads
    useEffect(() => {
        if (fetcher.data) {
            setJournals(fetcher.data.journals);
            setFilterOptions(fetcher.data.filters);
        }
    }, [fetcher.data]);

    return (
        // Todo : Add the header
        <div className="container py-4">
            <h1 className="mb-4">Your Journals</h1>

            {/* Filter Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Filters</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="search" className="form-label">Search</label>
                            <input
                                type="text"
                                id="search"
                                className="form-control"
                                placeholder="Search titles or content..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                className="form-select"
                                value={filters.categoryId}
                                onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                            >
                                <option value="">All Categories</option>
                                {filterOptions.categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="mood" className="form-label">Mood</label>
                            <select
                                id="mood"
                                className="form-select"
                                value={filters.mood}
                                onChange={(e) => setFilters({...filters, mood: e.target.value})}
                            >
                                <option value="">All Moods</option>
                                {filterOptions.moods.map(mood => (
                                    <option key={mood} value={mood}>{mood}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="startDate" className="form-label">From Date</label>
                            <input
                                type="date"
                                id="startDate"
                                className="form-control"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="endDate" className="form-label">To Date</label>
                            <input
                                type="date"
                                id="endDate"
                                className="form-control"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="tag" className="form-label">Tag</label>
                            <input
                                type="text"
                                id="tag"
                                className="form-control"
                                placeholder="Filter by tag..."
                                value={filters.tag}
                                onChange={(e) => setFilters({...filters, tag: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Journal List */}
            <div className="card">
                <div className="card-body">
                    {fetcher.state === "loading" ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : journals.length === 0 ? (
                        <div className="text-center py-4">
                            <p>No journals found. Create your first journal!</p>
                            <a href="/journals/new" className="btn btn-primary">Create Journal</a>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Mood</th>
                                    <th>Tags</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {journals.map(journal => (
                                    <tr key={journal.id}>
                                        <td>
                                            <a href={`/journals/${journal.id}`} className="text-decoration-none">
                                                {journal.title}
                                            </a>
                                        </td>
                                        <td>{new Date(journal.date).toLocaleDateString()}</td>
                                        <td>
                        <span className="badge bg-primary">
                          {journal.category.title}
                        </span>
                                        </td>
                                        <td>
                                            {journal.mood && (
                                                <span className={`badge ${
                                                    journal.mood === 'Happy' ? 'bg-success' :
                                                        journal.mood === 'Sad' ? 'bg-secondary' :
                                                            'bg-info'
                                                }`}>
                            {journal.mood}
                          </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {journal.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge bg-light text-dark"
                                                        onClick={() => setFilters({...filters, tag})}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                              {tag}
                            </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <a
                                                    href={`/journals/${journal.id}/edit`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Edit
                                                </a>
                                                {/*<DeleteJournalButton journalId={journal.id} />*/}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}