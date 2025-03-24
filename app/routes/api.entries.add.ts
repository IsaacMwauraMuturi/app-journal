// app/routes/api.entries.add.ts
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { requireUserSession } from "~/utils/session.server";
import validator from "validator";

const prisma = new PrismaClient();

export async function action({ request }) {
    // Ensure the user is authenticated
    const userId = await requireUserSession(request);

    // Parse the request body as JSON
    const body = await request.json();
    const { title, content, category, date, image } = body; // Add image to the destructured fields

    // Validate the input
    if (!title || !content || !category || !date) {
        return json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate title (e.g., minimum length)
    if (title.length < 3 || title.length > 100) {
        return json(
            { error: "Title must be between 3 and 100 characters" },
            { status: 400 }
        );
    }

    // Validate content (e.g., minimum length)
    if (content.length < 10 || content.length > 5000) {
        return json(
            { error: "Content must be between 10 and 5000 characters" },
            { status: 400 }
        );
    }

    // Validate date (e.g., must be a valid date)
    if (!validator.isDate(date)) {
        return json({ error: "Invalid date format" }, { status: 400 });
    }

    // Convert the date to a valid Date object
    const realDate = new Date(date);

    // Ensure the date is not in the future
    if (realDate > new Date()) {
        return json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    // Check if the category exists, or create a new one
    let categoryRecord = await prisma.journalCategory.findFirst({
        where: { title: category },
    });

    if (!categoryRecord) {
        // Create a new category if it doesn't exist
        categoryRecord = await prisma.journalCategory.create({
            data: {
                title: category,
                description: `Category for ${category} journals`, // Optional: Add a description
                image: image || "no image", // Use the provided image or set it to null
            },
        });
    }

    // Create the new journal entry
    try {
        const newEntry = await prisma.journal.create({
            data: {
                title,
                content,
                date: realDate,
                userId, // Associate the entry with the logged-in user
                categoryId: categoryRecord.id, // Assign the category ID
                image: image || "no image", // Use the provided image or set it to null
            },
        });

        return json({ success: true, entry: newEntry }, { status: 201 });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        return json({ error: "Failed to create journal entry" }, { status: 500 });
    }
}