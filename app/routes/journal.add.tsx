import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { useState, useEffect, useCallback } from "react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);
    const categories = await prisma.journalCategory.findMany();
    return json({ categories, userId });
}

export async function action({ request }) {
    const userId = await requireUserSession(request);
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    let content = formData.get("content")?.toString().trim();
    const image = formData.get("image")?.toString().trim() || "";
    const date = formData.get("date");
    const categoryInput = formData.get("category")?.toString().trim();

    if (!title || !content || !date || !categoryInput) {
        return json({ error: "All fields are required" }, { status: 400 });
    }

    try {
        // Load NLP libraries dynamically
        const { default: compromise } = await import("compromise");
        const Sentiment = (await import("sentiment")).default;

        // Process content with NLP
        let doc = compromise(content);
        content = doc.sentences().toTitleCase().out();

        // Sentiment analysis
        const sentiment = new Sentiment();
        const sentimentScore = sentiment.analyze(content).score;
        let mood = sentimentScore > 0 ? "Positive" : sentimentScore < 0 ? "Negative" : "Neutral";

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

        // Create journal entry
        await prisma.journal.create({
            data: {
                title,
                content,
                date: new Date(date),
                userId,
                categoryId: category.id,
                image,
                mood,
            },
        });

        return redirect("/dashboard");
    } catch (error) {
        console.error("Journal creation error:", error);
        return json({ error: "Failed to create journal entry. Please try again." }, { status: 500 });
    }
}

export default function AddJournal() {
    const { categories } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();

    const [categoryInput, setCategoryInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [mood, setMood] = useState("Neutral");

    useEffect(() => {
        // Ensures hydration matches by waiting for UI updates
    }, []);

    // const handleContentBlur = useCallback(async (event) => {
    //     const content = event.target.value.trim();
    //     if (!content) return;
    //
    //     try {
    //         const { default: compromise } = await import("compromise");
    //         const doc = compromise(content);
    //
    //         const keywords = doc.nouns().out("array").slice(0, 3).join(" ") || "General";
    //         setCategoryInput(keywords);
    //
    //         const positiveWords = doc.match("#Positive").out("array");
    //         const negativeWords = doc.match("#Negative").out("array");
    //         setMood(positiveWords.length > negativeWords.length ? "Positive" : negativeWords.length > positiveWords.length ? "Negative" : "Neutral");
    //     } catch (error) {
    //         console.error("NLP processing error:", error);
    //     }
    // }, []);
    const handleContentBlur = async (event) => {
        const content = event.target.value;
        if (!content) return;

        try {
            // Import Sentiment dynamically
            const Sentiment = (await import("sentiment")).default;
            const sentiment = new Sentiment();
            const sentimentScore = sentiment.analyze(content).score;

            let detectedMood = "Neutral";
            if (sentimentScore > 0) detectedMood = "Positive";
            else if (sentimentScore < 0) detectedMood = "Negative";

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

    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h2 className="mb-4">Add New Journal</h2>

                {actionData?.error && <div className="alert alert-danger">{actionData.error}</div>}

                <Form method="post" className="needs-validation" noValidate>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input type="text" name="title" id="title" className="form-control" required minLength={3} />
                        <div className="invalid-feedback">Please provide a title (at least 3 characters)</div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="content" className="form-label">Content</label>
                        <textarea name="content" id="content" rows={5} className="form-control" required minLength={10} onBlur={handleContentBlur}></textarea>
                        <div className="invalid-feedback">Please write your journal content (at least 10 characters)</div>
                    </div>

                    <div className="mb-3 position-relative">
                        <label htmlFor="category" className="form-label">Category</label>
                        <input type="text" name="category" id="category" className="form-control" value={categoryInput} onChange={handleCategoryChange} required autoComplete="off" />
                        {suggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-1">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="list-group-item list-group-item-action cursor-pointer" onClick={() => { setCategoryInput(suggestion); setSuggestions([]); }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="image" className="form-label">Image URL (Optional)</label>
                        <input type="url" name="image" id="image" className="form-control" placeholder="https://example.com/image.jpg" />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input type="date" name="date" id="date" className="form-control" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Detected Mood</label>
                        <input type="text" className="form-control" value={mood} readOnly />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={navigation.state === "submitting"}>
                        {navigation.state === "submitting" ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : "Add Journal"}
                    </button>
                </Form>
            </div>
        </div>
    );
}
