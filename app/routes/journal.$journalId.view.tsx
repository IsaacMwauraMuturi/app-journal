// app/routes/journals.$journalId.tsx
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { Form } from "@remix-run/react";

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
            userId: userId // Ensure user can only access their own journals
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

    // Parse tags if they exist
    const tags = journal.tags ? JSON.parse(JSON.stringify(journal.tags)) : [];

    return json({
        journal: {
            ...journal,
            tags
        }
    });
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
        // Todo : Add the header
        <div className="max-w-4xl mx-auto p-6">
            <Form action={`/journal/${journal.id}/delete`} method="post">
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this journal?")) {
                            e.preventDefault();
                        }
                    }}
                >
                    Delete Journal
                </button>
            </Form>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Journals
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {journal.image && (
                    <div className="h-64 overflow-hidden">
                        <img
                            src={journal.image}
                            alt={journal.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{journal.title}</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {journal.category.title}
            </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span>By {journal.user.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formattedDate}</span>
                        {journal.mood && (
                            <>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                  <span className="mr-1">Mood:</span>
                  <span className="font-medium capitalize">{journal.mood.toLowerCase()}</span>
                </span>
                            </>
                        )}
                    </div>

                    {journal.tags && journal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {journal.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                                >
                  {tag}
                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose max-w-none">
                        <p className="whitespace-pre-line text-gray-700">{journal.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}