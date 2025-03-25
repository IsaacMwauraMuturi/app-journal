import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { useState, useEffect, useCallback } from "react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);
    const categories = await prisma.journalCategory.findMany();
    const userJournals = await prisma.journal.findMany({
        where: { userId },
        include: { category: true },
    });

    // Get all journals to extract tags
    const allJournals = await prisma.journal.findMany({
        where: { userId },
    });

    // Extract tags from JSON field
    const existingTags = Array.from(
        new Set(
            allJournals
                .filter(j => j.tags)
                .flatMap(j => {
                    try {
                        return typeof j.tags === 'string' ? JSON.parse(j.tags) : j.tags;
                    } catch {
                        return [];
                    }
                })
                .filter(tag => tag) // Remove any null/undefined tags
        )
    );

    return json({
        categories,
        userId,
        userJournals,
        existingTags
    });
}

export async function action({ request }) {
    const userId = await requireUserSession(request);
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    let content = formData.get("content")?.toString().trim();
    const image = formData.get("image")?.toString().trim() || "";
    const date = formData.get("date");
    const categoryInput = formData.get("category")?.toString().trim();
    const tagsInput = formData.get("tags")?.toString().trim();
    const mood = formData.get("manualMood")?.toString().trim();

    if (!title || !content || !date || !categoryInput) {
        return json({ error: "Title, content, date and category are required" }, { status: 400 });
    }

    try {
        // Process tags into JSON array
        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : null;


        // Find or create category
        let category = await prisma.journalCategory.findFirst({
            where: { title: categoryInput },
        });

        if (!category) {
            category = await prisma.journalCategory.create({
                data: {
                    title: categoryInput,
                    description: `Auto-generated category for ${categoryInput}`,
                    image: "",
                },
            });
        }
        await prisma.journal.create({
            data: {
                title,
                content,
                date: new Date(date),
                userId,
                categoryId: category.id,
                image: image || undefined,
                mood: mood || undefined,
                tags: tags ? JSON.parse(JSON.stringify(tags)) : undefined,
            },
        });
        // // Create journal entry with tags and mood
        // await prisma.journal.create({
        //     data: {
        //         title,
        //         content,
        //         date: new Date(date),
        //         userId,
        //         categoryId: category.id,
        //         image,
        //         mood,
        //         tags: tags || undefined, // Use undefined instead of null for Prisma
        //     },
        // });

        return redirect("/dashboard");
    } catch (error) {
        console.error("Journal creation error:", error);
        return json({
            error: "Failed to create journal entry. Please try again."
        }, { status: 500 });
    }
}

export default function AddJournal() {
    const { categories, existingTags } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();

    const [categoryInput, setCategoryInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [mood, setMood] = useState("Neutral");
    const [tags, setTags] = useState("");
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const { userJournals } = useLoaderData();

    const handleContentBlur = async (event) => {
        const content = event.target.value;
        if (!content) return;

        try {
            // Import NLP tools dynamically
            const { default: compromise } = await import("compromise");
            const Sentiment = (await import("sentiment")).default;

            const sentiment = new Sentiment();
            const sentimentScore = sentiment.analyze(content).score;

            let detectedMood = "Neutral";
            if (sentimentScore > 0) detectedMood = "Happy";
            else if (sentimentScore < 0) detectedMood = "Sad";

            setMood(detectedMood);
        } catch (error) {
            console.error("Sentiment analysis error:", error);
        }
    };

    const handleCategoryChange = useCallback((e) => {
        const value = e.target.value;
        setCategoryInput(value);

        if (value.length > 0) {
            const filtered = categories
                .filter(cat => cat.title.toLowerCase().includes(value.toLowerCase()))
                .map(cat => cat.title);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [categories]);

    const handleTagsChange = (e) => {
        const value = e.target.value;
        setTags(value);

        if (value.includes(',')) {
            setTagSuggestions([]);
        } else if (value.length > 0) {
            const filtered = existingTags
                .filter(tag => tag.toLowerCase().includes(value.toLowerCase()));
            setTagSuggestions(filtered);
        } else {
            setTagSuggestions([]);
        }
    };

    const addTagSuggestion = (tag) => {
        const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
        if (!currentTags.includes(tag)) {
            setTags(currentTags.concat(tag).join(', '));
        }
        setTagSuggestions([]);
    };

    return (
        // Todo : Add the header// Todo : Add the header
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h2 className="mb-4">Add New Journal</h2>

                {actionData?.error && (
                    <div className="alert alert-danger">{actionData.error}</div>
                )}

                <Form method="post" className="needs-validation" noValidate>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="form-control"
                            required
                            minLength={3}
                        />
                        <div className="invalid-feedback">
                            Please provide a title (at least 3 characters)
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="content" className="form-label">Content</label>
                        <textarea
                            name="content"
                            id="content"
                            rows={5}
                            className="form-control"
                            required
                            minLength={10}
                            onChange={handleContentBlur}
                            onBlur={handleContentBlur}
                        ></textarea>
                        <div className="invalid-feedback">
                            Please write your journal content (at least 10 characters)
                        </div>
                    </div>

                    <div className="mb-3 position-relative">
                        <label htmlFor="category" className="form-label">Category</label>
                        <input
                            type="text"
                            name="category"
                            id="category"
                            className="form-control"
                            value={categoryInput}
                            onChange={handleCategoryChange}
                            required
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-1">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="list-group-item list-group-item-action cursor-pointer"
                                        onClick={() => {
                                            setCategoryInput(suggestion);
                                            setSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mb-3 position-relative">
                        <label htmlFor="tags" className="form-label">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            className="form-control"
                            value={tags}
                            onChange={handleTagsChange}
                            placeholder="e.g. work, personal, goals"
                        />
                        {tagSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-1">
                                {tagSuggestions.map((tag, index) => (
                                    <li
                                        key={index}
                                        className="list-group-item list-group-item-action cursor-pointer"
                                        onClick={() => addTagSuggestion(tag)}
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="image" className="form-label">
                            Image URL (Optional)
                        </label>
                        <input
                            type="url"
                            name="image"
                            id="image"
                            className="form-control"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            className="form-control"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="manualMood" className="form-label">
                            Mood (Detected: {mood})
                        </label>
                        <select
                            name="manualMood"
                            id="manualMood"
                            className="form-select"
                            defaultValue={mood}
                        >
                            <option value="Happy">Happy</option>
                            <option value="Sad">Sad</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Excited">Excited</option>
                            <option value="Angry">Angry</option>
                            <option value="Anxious">Anxious</option>
                            <option value="Calm">Calm</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={navigation.state === "submitting"}
                    >
                        {navigation.state === "submitting" ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"
                                      role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : "Add Journal"}
                    </button>
                </Form>
            </div>
        </div>
    );
}