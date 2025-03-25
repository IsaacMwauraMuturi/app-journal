// app/routes/journals.$journalId.edit.tsx
import { Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";
import { useState, useEffect } from "react";

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
            category: true
        }
    });

    if (!journal) {
        throw new Response("Journal not found", { status: 404 });
    }

    const categories = await prisma.journalCategory.findMany();

    // Parse tags if they exist
    const tags = journal.tags ? JSON.parse(JSON.stringify(journal.tags)).join(', ') : '';

    return json({
        journal: {
            ...journal,
            tags
        },
        categories
    });
}

export async function action({ request, params }) {
    const userId = await requireUserSession(request);
    const journalId = parseInt(params.journalId);
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    const content = formData.get("content")?.toString().trim();
    const image = formData.get("image")?.toString().trim() || null;
    const date = formData.get("date");
    const categoryId = formData.get("categoryId")?.toString().trim();
    const tagsInput = formData.get("tags")?.toString().trim();
    const mood = formData.get("mood")?.toString().trim();

    if (!title || !content || !date || !categoryId) {
        return json({ error: "Title, content, date and category are required" }, { status: 400 });
    }

    try {
        // Process tags into JSON array
        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : null;

        await prisma.journal.update({
            where: {
                id: journalId,
                userId: userId // Ensure user can only edit their own journals
            },
            data: {
                title,
                content,
                date: new Date(date),
                categoryId: parseInt(categoryId),
                image,
                mood,
                tags: tags ? JSON.parse(JSON.stringify(tags)) : null
            }
        });

        return redirect(`/journals/${journalId}`);
    } catch (error) {
        console.error("Journal update error:", error);
        return json({
            error: "Failed to update journal entry. Please try again."
        }, { status: 500 });
    }
}

export default function EditJournal() {
    const { journal, categories } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [tags, setTags] = useState(journal.tags || '');
    const [tagSuggestions, setTagSuggestions] = useState([]);

    // Extract all unique tags from user's journals for suggestions
    useEffect(() => {
        async function loadTagSuggestions() {
            const response = await fetch('/api/user/tags');
            if (response.ok) {
                const data = await response.json();
                setTagSuggestions(data.tags);
            }
        }
        loadTagSuggestions();
    }, []);

    const handleTagsChange = (e) => {
        const value = e.target.value;
        setTags(value);
    };

    return (
        // Todo : Add the header
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Journal</h1>

            {actionData?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={journal.title}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={8}
                        defaultValue={journal.content}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            defaultValue={new Date(journal.date).toISOString().split('T')[0]}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            defaultValue={journal.categoryId}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            required
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                            Mood
                        </label>
                        <select
                            id="mood"
                            name="mood"
                            defaultValue={journal.mood || 'Neutral'}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="Happy">Happy</option>
                            <option value="Sad">Sad</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Excited">Excited</option>
                            <option value="Angry">Angry</option>
                            <option value="Anxious">Anxious</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Image URL (Optional)
                        </label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            defaultValue={journal.image || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={tags}
                        onChange={handleTagsChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        placeholder="work, personal, goals"
                    />
                    {tagSuggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tagSuggestions.map((tag, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setTags(prev => prev ? `${prev}, ${tag}` : tag)}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <a
                        href={`/journals/${journal.id}`}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </a>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </Form>
        </div>
    );
}