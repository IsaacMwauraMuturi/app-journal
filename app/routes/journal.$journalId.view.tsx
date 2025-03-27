import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardImage,
    CContainer,
    CRow,
    CCol,
    CBadge
} from '@coreui/react';

const prisma = new PrismaClient();

/**
 * Loader function to fetch journal data for a specific user.
 */
export async function loader({ request, params }) {
    // Get authenticated user ID
    const userId = await requireUserSession(request);

    // Parse journal ID from request parameters
    const journalId = parseInt(params.journalId);

    // Validate journal ID
    if (isNaN(journalId)) {
        throw new Response("Invalid journal ID", { status: 400 });
    }

    // Fetch journal details from the database
    const journal = await prisma.journal.findUnique({
        where: {
            id: journalId,
            userId: userId, // Ensure the journal belongs to the user
        },
        include: {
            category: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    // Return 404 error if the journal is not found
    if (!journal) {
        throw new Response("Journal not found", { status: 404 });
    }

    // Ensure tags are correctly parsed
    const tags = journal.tags ? JSON.parse(JSON.stringify(journal.tags)) : [];

    return json({ journal: { ...journal, tags } });
}

/**
 * Component to display journal details.
 */
export default function JournalView() {
    const { journal } = useLoaderData();
    const navigate = useNavigate();

    // Format the journal date
    const formattedDate = new Date(journal.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <CContainer fluid className="min-vh-100 d-flex flex-column">
            <CRow className="justify-content-center flex-grow-1">
                <CCol md={10} lg={8} className="d-flex align-items-center">
                    <CCard className="w-100 shadow">

                        {/* Card Header with Journal Title */}
                        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="m-0">{journal.title}</h5>
                        </CCardHeader>

                        <CCardBody className="d-flex flex-column justify-content-between" style={{ minHeight: "75vh" }}>
                            <div>
                                {/* Category Section */}
                                <div className="mb-3">
                                    <strong>Category:</strong>
                                    <CBadge color="dark" className="ms-2">
                                        {journal.category.title}
                                    </CBadge>
                                </div>

                                {/* Journal Meta Info */}
                                <div className="d-flex align-items-center text-muted small mb-3">
                                    <span>By {journal.user.name}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formattedDate}</span>

                                    {/* Mood Badge */}
                                    {journal.mood && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <CBadge color="info" className="text-capitalize">
                                                {journal.mood.toLowerCase()}
                                            </CBadge>
                                        </>
                                    )}
                                </div>

                                {/* Tags Section */}
                                {journal.tags && journal.tags.length > 0 && (
                                    <div className="mb-3">
                                        {journal.tags.map((tag, index) => (
                                            <CBadge key={index} color="secondary" className="me-1">
                                                {tag}
                                            </CBadge>
                                        ))}
                                    </div>
                                )}

                                {/* Journal Content */}
                                <p className="text-dark">{journal.content}</p>

                                {/* Display Image if Available */}
                                {journal.image?.trim() && (
                                    <CCardImage orientation="top" src={journal.image} className="rounded-top" />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-between mt-4">
                                {/* Delete Journal Button */}
                                <CButton
                                    color="danger"
                                    onClick={(e) => {
                                        if (!confirm("Are you sure you want to delete this journal?")) {
                                            e.preventDefault();
                                        }
                                    }}
                                    href={`/journal/${journal.id}/delete`}
                                >
                                    Delete Journal
                                </CButton>

                                {/* Back to Journals Button */}
                                <CButton color="secondary" onClick={() => navigate("/journals")}>
                                    Back to Journals
                                </CButton>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
}
