import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { useState, useEffect, useCallback } from "react";
import { PrismaClient } from "@prisma/client";
import {CCard, CCardBody, CCardHeader, CContainer} from "@coreui/react";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);
    const categories = await prisma.journalCategory.findMany();
    const userJournals = await prisma.journal.findMany({
        where: { userId },
        include: { category: true },
    });

    const allJournals = await prisma.journal.findMany({
        where: { userId },
    });

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
                .filter(tag => tag)
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
        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : null;

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
            const { default: compromise } = await import("compromise");
            const Sentiment = (await import("sentiment")).default;

            const sentiment = new Sentiment();
            const sentimentScore = sentiment.analyze(content).score;

            let detectedMood = "Neutral";

            // Enhanced sentiment analysis mapping
            if (sentimentScore > 3) detectedMood = "Excited";
            else if (sentimentScore > 1.5) detectedMood = "Happy";
            else if (sentimentScore > 0.5) detectedMood = "Calm";
            else if (sentimentScore < -3) detectedMood = "Angry";
            else if (sentimentScore < -1.5) detectedMood = "Anxious";
            else if (sentimentScore < -0.5) detectedMood = "Sad";
            // Neutral remains the default

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
        <CContainer fluid className="min-vh-100 d-flex flex-column">
            <h1 className="mb-4">Your Journals</h1>
            <CCard className="mb-4">

                <CCardBody>
                    <div className="c-app c-default-layout">
                        <div className="c-wrapper">
                            <main className="c-main">
                                <div className="container-fluid">
                                    <div className="fade-in">
                                        <div className="row justify-content-center">
                                            <div className="col-md-10">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5>Add New Journal Entry</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {actionData?.error && (
                                                            <div className="alert alert-danger">
                                                                {actionData.error}
                                                            </div>
                                                        )}

                                                        <Form method="post">
                                                            <div className="row mb-3">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="title"
                                                                           className="form-label">Title</label>
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
                                                                <div className="col-md-6">
                                                                    <label htmlFor="date"
                                                                           className="form-label">Date</label>
                                                                    <input
                                                                        type="date"
                                                                        name="date"
                                                                        id="date"
                                                                        className="form-control"
                                                                        required
                                                                        defaultValue={new Date().toISOString().split('T')[0]}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="row mb-3">
                                                                <div className="col-md-12">
                                                                    <label htmlFor="content"
                                                                           className="form-label">Content</label>
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
                                                                        Please write your journal content (at least 10
                                                                        characters)
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row mb-3">
                                                                <div className="col-md-6 position-relative">
                                                                    <label htmlFor="category"
                                                                           className="form-label">Category</label>
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
                                                                        <div className="dropdown-menu show w-100">
                                                                            {suggestions.map((suggestion, index) => (
                                                                                <button
                                                                                    key={index}
                                                                                    className="dropdown-item"
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setCategoryInput(suggestion);
                                                                                        setSuggestions([]);
                                                                                    }}
                                                                                >
                                                                                    {suggestion}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="manualMood" className="form-label">
                                                                        Mood (Detected: {mood})
                                                                    </label>
                                                                    <select
                                                                        name="manualMood"
                                                                        id="manualMood"
                                                                        className="form-select"
                                                                        defaultValue={mood}
                                                                        value={mood}
                                                                        readonly
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
                                                            </div>

                                                            <div className="row mb-3">
                                                                <div className="col-md-6 position-relative">
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
                                                                        <div className="dropdown-menu show w-100">
                                                                            {tagSuggestions.map((tag, index) => (
                                                                                <button
                                                                                    key={index}
                                                                                    className="dropdown-item"
                                                                                    type="button"
                                                                                    onClick={() => addTagSuggestion(tag)}
                                                                                >
                                                                                    {tag}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="col-md-6">
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
                                                            </div>

                                                            <div className="row mt-4">
                                                                <div className="col-md-12 text-end">
                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-primary px-4"
                                                                        disabled={navigation.state === "submitting"}
                                                                    >
                                                                        {navigation.state === "submitting" ? (
                                                                            <>
                                                                    <span
                                                                        className="spinner-border spinner-border-sm me-2"
                                                                        role="status" aria-hidden="true"></span>
                                                                                Saving...
                                                                            </>
                                                                        ) : "Add Journal"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </CCardBody>
            </CCard>
        </CContainer>


    );
}