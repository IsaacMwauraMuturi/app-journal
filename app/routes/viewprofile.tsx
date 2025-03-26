import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CButton, CListGroup, CListGroupItem } from "@coreui/react";

const prisma = new PrismaClient();

export async function loader({ request }: { request: Request }) {
    const userId = await requireUserSession(request);

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            journals: {
                select: {
                    id: true,
                    title: true,
                    date: true
                },
                orderBy: { date: 'desc' },
                take: 5
            }
        }
    });

    if (!user) {
        throw redirect("/login");
    }

    return json({ user });
}

export default function ProfilePage() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <CContainer  className="pt-5 min-vh-100 d-flex flex-column">
            <CRow className="pt-5 justify-content-center">
                <CCol md={8} lg={6}>
                    <CCard className="shadow-sm">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Your Profile</h4>
                            <CButton color="primary" href="/profile/edit">Edit Profile</CButton>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup flush>
                                <CListGroupItem><strong>Name:</strong> {user.name}</CListGroupItem>
                                <CListGroupItem><strong>Email:</strong> {user.email}</CListGroupItem>
                                <CListGroupItem><strong>Phone:</strong> {user.phone}</CListGroupItem>
                            </CListGroup>
                        </CCardBody>
                    </CCard>

                    {user.journals.length > 0 && (
                        <CCard className="shadow-sm mt-4">
                            <CCardHeader>Recent Journals</CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    {user.journals.map(journal => (
                                        <CListGroupItem key={journal.id} className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="mb-1">{journal.title}</h5>
                                                <small className="text-muted">Created: {new Date(journal.date).toLocaleDateString()}</small>
                                            </div>
                                            <CButton color="primary" href={`/journal/${journal.id}/view`}>View</CButton>
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                                {user.journals.length === 5 && (
                                    <div className="text-end mt-3">
                                        <CButton color="link" href="/journals">View all journals →</CButton>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    )}
                </CCol>
            </CRow>
        </CContainer>
    );
}
