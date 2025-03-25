import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { CButton, CCard, CCardBody, CCardHeader, CCardImage, CContainer, CRow, CCol, CBadge } from '@coreui/react';

const prisma = new PrismaClient();

export async function loader({ request, params }) {
    const userId = await requireUserSession(request);
    const journalId = parseInt(params.journalId);

    if (isNaN(journalId)) {
        throw new Response("Invalid journal ID", { status: 400 });
    }

    const journal = await prisma.journal.findUnique({
        where: {
            id: journalId,
            userId: userId
        },
        include: {
            category: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!journal) {
        throw new Response("Journal not found", { status: 404 });
    }

    const tags = journal.tags ? JSON.parse(JSON.stringify(journal.tags)) : [];

    return json({ journal: { ...journal, tags } });
}

export default function JournalView() {
    const { journal } = useLoaderData();
    const navigate = useNavigate();

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

                                {/* Content */}
                                <p className="text-dark">{journal.content}</p>
                                {journal.image?.trim() && (
                                    <CCardImage orientation="top" src={journal.image} className="rounded-top" />
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="d-flex justify-content-between mt-4">
                                <CButton color="danger"
                                         onClick={(e) => {
                                             if (!confirm("Are you sure you want to delete this journal?")) {
                                                 e.preventDefault();
                                             }
                                         }}
                                         href={`/journal/${journal.id}/delete`}
                                >
                                    Delete Journal
                                </CButton>

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
