import { json, LoaderFunction } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import CalendarHeatmap from 'react-calendar-heatmap';
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-calendar-heatmap/dist/styles.css";
import "chart.js/auto";
import { FaPlus } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

// Initialize Prisma client and calendar localizer
const prisma = new PrismaClient();
const localizer = momentLocalizer(moment);

/**
 * Loader function that fetches journal entries for the current user
 * with optional date range filtering
 */
export let loader: LoaderFunction = async ({ request }) => {
    // Ensure user is authenticated
    const userId = await requireUserSession(request);
    const url = new URL(request.url);

    // Get date range from query parameters
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Fetch journal entries with optional date filtering
    const entries = await prisma.journal.findMany({
        where: {
            userId,
            date: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined,
            }
        },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 100,
    });

    return json({ entries });
};

/**
 * Dashboard component displaying various analytics and visualizations
 * of journal entries
 */
export default function Dashboard() {
    // Data and state management
    const { entries } = useLoaderData();
    const fetcher = useFetcher();
    const canvasRef = useRef(null);
    const [wordCloudReady, setWordCloudReady] = useState(false);

    // Default date range: last month to today
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
    });

    // Handle date range input changes
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Apply date filter by reloading data with new date range
    const applyDateFilter = () => {
        fetcher.load(`/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
    };

    // Reset date filter to default values
    const resetDateFilter = () => {
        setDateRange({
            startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD')
        });
        fetcher.load('/dashboard');
    };

    // Use fetcher data if available, otherwise use loader data
    const displayEntries = fetcher.data?.entries || entries;

    // Common chart configuration options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    /**
     * Chart Data Preparation
     */

        // Category Distribution Pie Chart Data
    const categoryChartData = {
            labels: [...new Set(displayEntries.map(entry => entry.category.title))],
            datasets: [{
                data: [...new Set(displayEntries.map(entry => entry.category.title))]
                    .map(category => displayEntries.filter(e => e.category.title === category).length),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#8AC249', '#EA3546'
                ],
            }],
        };

    // Mood Tracking Analysis Bar Chart Data
    const moodChartData = {
        labels: [...new Set(displayEntries.filter(e => e.mood).map(e => e.mood))],
        datasets: [{
            data: [...new Set(displayEntries.filter(e => e.mood).map(e => e.mood))]
                .map(mood => displayEntries.filter(e => e.mood === mood).length),
            backgroundColor: [
                '#4CAF50', // Happy
                '#FFC107', // Sad
                '#2196F3', // Neutral
                '#9C27B0', // Excited
                '#F44336'  // Angry
            ],
        }],
    };

    // Word Count Trends Line Chart Data
    const wordCountChartData = {
        labels: displayEntries.map(e => moment(e.date).format('MMM D')),
        datasets: [{
            label: "Word Count",
            data: displayEntries.map(e => e.content.split(" ").length),
            borderColor: "#36A2EB",
            tension: 0.1,
            fill: false
        }],
    };

    // Calculate average word counts by category
    const categoryAverages = [...new Set(displayEntries.map(e => e.category.title))]
        .map(category => {
            const categoryEntries = displayEntries.filter(e => e.category.title === category);
            const avgWords = categoryEntries.reduce((sum, e) => sum + e.content.split(" ").length, 0) / categoryEntries.length;
            return { category, avgWords };
        });

    // Entry Length Averages by Category Bar Chart Data
    const categoryAverageChartData = {
        labels: categoryAverages.map(d => d.category),
        datasets: [{
            label: "Avg Words",
            data: categoryAverages.map(d => d.avgWords),
            backgroundColor: "#FFCE56"
        }],
    };

    // Prepare data for writing frequency heatmap
    const heatmapData = displayEntries.map(entry => ({
        date: moment(entry.date).format('YYYY-MM-DD'),
        count: 1,
    }));

    /**
     * Word Cloud Effect
     * Dynamically imports and renders word cloud based on journal content
     */
    useEffect(() => {
        if (canvasRef.current && !wordCloudReady && displayEntries.length > 0) {
            // Process words from journal entries
            const wordCloudWords = displayEntries
                .flatMap(e => e.content.toLowerCase().split(/\s+/))
                .filter(word => word.length > 3)
                .reduce((acc, word) => {
                    acc[word] = (acc[word] || 0) + 1;
                    return acc;
                }, {});

            // Dynamically import and render word cloud
            import("wordcloud").then(WordCloud => {
                WordCloud.default(canvasRef.current, {
                    list: Object.entries(wordCloudWords),
                    gridSize: 16,
                    weightFactor: 30,
                    fontFamily: "Arial",
                    color: () => `hsl(${Math.random() * 360}, 70%, 50%)`,
                    backgroundColor: "#f8f9fa",
                });
                setWordCloudReady(true);
            });
        }
    }, [displayEntries]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Journal Analytics</h2>

            {/* Date Range Filter Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Date Range Filter</h5>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-control"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="form-control"
                                value={dateRange.endDate}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex align-items-end gap-2">
                            <button
                                onClick={applyDateFilter}
                                className="btn btn-primary"
                                disabled={fetcher.state === "loading"}
                            >
                                {fetcher.state === "loading" ? "Applying..." : "Apply Filter"}
                            </button>
                            <button
                                onClick={resetDateFilter}
                                className="btn btn-outline-secondary"
                                disabled={fetcher.state === "loading"}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* First Row - Category and Mood Charts */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Category Distribution</h5>
                            <div style={{ height: '300px' }}>
                                <Pie data={categoryChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Mood Tracking</h5>
                            <div style={{ height: '300px' }}>
                                <Bar
                                    data={moodChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'y'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row - Calendar and Writing Frequency */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Entry Calendar</h5>
                            <Calendar
                                localizer={localizer}
                                events={displayEntries.map(entry => ({
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
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Entry Length by Category</h5>
                            <div style={{height: '300px'}}>
                                <Bar
                                    data={categoryAverageChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'x'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Third Row - Word Count and Word Cloud */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Word Count Trends</h5>
                            <div style={{height: '300px'}}>
                                <Line data={wordCountChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Word Cloud</h5>
                            <div className="d-flex justify-content-center">
                                <canvas
                                    ref={canvasRef}
                                    width={450}
                                    height={300}
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fourth Row - Writing Frequency Heatmap */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Writing Frequency Heatmap</h5>
                            <div className="col-md-12">
                                <CalendarHeatmap
                                    startDate={moment().subtract(1, "year").toDate()}
                                    endDate={moment().toDate()}
                                    values={heatmapData}
                                    classForValue={value => (!value ? "color-empty" : "color-filled")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Journal Entries Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Recent Journal Entries</h5>
                    <a href="/journal/add" className="btn btn-primary">
                        <FaPlus className="me-2"/>
                        Add New Entry
                    </a>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Mood</th>
                                <th>Word Count</th>
                            </tr>
                            </thead>
                            <tbody>
                            {displayEntries.map(entry => (
                                <tr key={entry.id}>
                                    <td>{moment(entry.date).format('MMM D, YYYY')}</td>
                                    <td>
                                        <a href={`/journal/${entry.id}/view`} className="text-decoration-none">
                                            {entry.title || 'Untitled'}
                                        </a>
                                    </td>
                                    <td>
                                            <span className="badge bg-primary">
                                                {entry.category.title}
                                            </span>
                                    </td>
                                    <td>
                                        {entry.mood && (
                                            <span className={`badge ${
                                                entry.mood === 'Happy' ? 'bg-success' :
                                                    entry.mood === 'Sad' ? 'bg-warning text-dark' :
                                                        'bg-info'
                                            }`}>
                                                    {entry.mood}
                                                </span>
                                        )}
                                    </td>
                                    <td>{entry.content.split(' ').length}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}