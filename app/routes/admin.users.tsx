import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { CContainer, CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButton } from "@coreui/react";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ request }) => {
    // Require admin role
    const userId = await requireUserSession(request);

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user || user.role.name !== 'Admin') {
        throw new Response("Unauthorized", { status: 401 });
    }

    // Get pagination parameters
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: perPage,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'desc'
            }
        }),
        prisma.user.count()
    ]);

    return json({
        users: users.map(user => ({
            ...user,
            role: user.role.name,
            // createdAt: user.createdAt.toISOString().split('T')[0]
        })),
        currentPage: page,
        totalPages: Math.ceil(totalUsers / perPage)
    });
};

export default function UsersAdmin() {
    const { users, currentPage, totalPages } = useLoaderData<typeof loader>();

    return (
        <CContainer fluid className="pt-5 my-4 min-vh-100">
            <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h2>User Management</h2>
                    <Link to="#">
                        <CButton color="primary">Add New User</CButton>
                    </Link>
                </CCardHeader>
                <CCardBody>
                    <CTable striped hover responsive>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>ID</CTableHeaderCell>
                                <CTableHeaderCell>Name</CTableHeaderCell>
                                <CTableHeaderCell>Email</CTableHeaderCell>
                                <CTableHeaderCell>Phone</CTableHeaderCell>
                                <CTableHeaderCell>Role</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {users.map(user => (
                                <CTableRow key={user.id}>
                                    <CTableDataCell>{user.id}</CTableDataCell>
                                    <CTableDataCell>{user.name}</CTableDataCell>
                                    <CTableDataCell>{user.email}</CTableDataCell>
                                    <CTableDataCell>{user.phone}</CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge color={user.role === 'Admin' ? 'success' : 'primary'}>
                                            {user.role}
                                        </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <Link to={`#`}>
                                            <CButton color="info" size="sm">Edit</CButton>
                                        </Link>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>

                    {/* Pagination */}
                    <div className="d-flex justify-content-center mt-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Link
                                key={page}
                                to={`?page=${page}`}
                                className={`mx-1 ${page === currentPage ? 'font-weight-bold' : ''}`}
                            >
                                <CButton
                                    color={page === currentPage ? 'primary' : 'secondary'}
                                    size="sm"
                                >
                                    {page}
                                </CButton>
                            </Link>
                        ))}
                    </div>
                </CCardBody>
            </CCard>
        </CContainer>
    );
}