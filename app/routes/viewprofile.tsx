// app/routes/viewprofile.tsx
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
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
                orderBy: {
                    date: 'desc'
                },
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
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <h1>Your Profile</h1>
                <a
                    href="/profile/edit"
                    style={{
                        padding: "8px 16px",
                        background: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px"
                    }}
                >
                    Edit Profile
                </a>
            </div>

            <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "30px"
            }}>
                <h2 style={{ marginBottom: "20px" }}>Personal Information</h2>

                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "15px" }}>
                    <div style={{ fontWeight: "bold" }}>Name:</div>
                    <div>{user.name}</div>

                    <div style={{ fontWeight: "bold" }}>Email:</div>
                    <div>{user.email}</div>

                    <div style={{ fontWeight: "bold" }}>Phone:</div>
                    <div>{user.phone}</div>
                </div>
            </div>

            {user.journals.length > 0 && (
                <div style={{
                    background: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "8px"
                }}>
                    <h2 style={{ marginBottom: "20px" }}>Recent Journals</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {user.journals.map(journal => (
                            <li key={journal.id} style={{
                                padding: "15px",
                                borderBottom: "1px solid #ddd",
                                display: "flex",
                                justifyContent: "space-between"
                            }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{journal.title}</h3>
                                    <small style={{ color: "#666" }}>
                                        Created: {new Date(journal.date).toLocaleDateString()}
                                    </small>
                                </div>
                                <a
                                    href={`/journals/${journal.id}`}
                                    style={{
                                        padding: "5px 10px",
                                        background: "#007bff",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "4px",
                                        alignSelf: "center"
                                    }}
                                >
                                    View
                                </a>
                            </li>
                        ))}
                    </ul>
                    {user.journals.length === 5 && (
                        <div style={{ textAlign: "right", marginTop: "15px" }}>
                            <a href="/journals">View all journals →</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}