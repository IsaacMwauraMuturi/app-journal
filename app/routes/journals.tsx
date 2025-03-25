import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CFormInput,
    CFormSelect,
    CButton,
    CSpinner,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge
} from "@coreui/react";

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

    useEffect(() => {
        fetcher.load("/api/journals");
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }
        fetcher.load(`/api/journals?${params.toString()}`);
    }, [filters]);

    useEffect(() => {
        if (fetcher.data) {
            setJournals(fetcher.data.journals);
            setFilterOptions(fetcher.data.filters);
        }
    }, [fetcher.data]);

    return (
        <CContainer fluid className="min-vh-100 d-flex flex-column">
            <h1 className="mb-4">Your Journals</h1>
            <CCard className="mb-4">
                <CCardHeader>Filters</CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormInput
                                type="text"
                                placeholder="Search titles or content..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </CCol>
                        <CCol md={3}>
                            <CFormSelect
                                value={filters.categoryId}
                                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {filterOptions.categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.title}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={3}>
                            <CFormSelect
                                value={filters.mood}
                                onChange={(e) => setFilters({ ...filters, mood: e.target.value })}
                            >
                                <option value="">All Moods</option>
                                {filterOptions.moods.map(mood => (
                                    <option key={mood} value={mood}>{mood}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={3}>
                            <CFormInput
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </CCol>
                        <CCol md={3}>
                            <CFormInput
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput
                                type="text"
                                placeholder="Filter by tag..."
                                value={filters.tag}
                                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
            <CCard>
                <CCardBody>
                    {fetcher.state === "loading" ? (
                        <div className="text-center py-4">
                            <CSpinner color="primary" />
                        </div>
                    ) : journals.length === 0 ? (
                        <div className="text-center py-4">
                            <p>No journals found. Create your first journal!</p>
                            <CButton color="primary" href="/journals/new">Create Journal</CButton>
                        </div>
                    ) : (
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Title</CTableHeaderCell>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell>Category</CTableHeaderCell>
                                    <CTableHeaderCell>Mood</CTableHeaderCell>
                                    <CTableHeaderCell>Tags</CTableHeaderCell>
                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {journals.map(journal => (
                                    <CTableRow key={journal.id}>
                                        <CTableDataCell>
                                            <a href={`/journal/${journal.id}/view`} className="text-decoration-none">
                                                {journal.title}
                                            </a>
                                        </CTableDataCell>
                                        <CTableDataCell>{new Date(journal.date).toLocaleDateString()}</CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color="primary">{journal.category.title}</CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {journal.mood && (
                                                <CBadge color={journal.mood === 'Happy' ? 'success' : journal.mood === 'Sad' ? 'secondary' : 'info'}>
                                                    {journal.mood}
                                                </CBadge>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div className="d-flex flex-wrap gap-1">
                                                {journal.tags.map((tag, index) => (
                                                    <CBadge key={index} color="light" textColor="dark" style={{ cursor: 'pointer' }} onClick={() => setFilters({ ...filters, tag })}>
                                                        {tag}
                                                    </CBadge>
                                                ))}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="outline-primary" size="sm" href={`/journal/${journal.id}/edit`}>Edit</CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>
        </CContainer>
    );
}