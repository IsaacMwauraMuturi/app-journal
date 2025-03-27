import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { requireUserSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export async function loader({ params, request }) {
    // Ensure the user is authenticated
    const userId = await requireUserSession(request);

    // Get the journal entry ID from the URL parameters
    const { id } = params;

    // Validate the ID
    if (!id || isNaN(Number(id))) {
        return json({ error: "Invalid journal entry ID" }, { status: 400 });
    }

    // Fetch the journal entry from the database
    try {
        const journalEntry = await prisma.journal.findUnique({
            where: { id: Number(id), userId }, // Ensure the entry belongs to the logged-in user
            include: {
                category: true, // Include the associated category
            },
        });

        // Check if the journal entry exists
        if (!journalEntry) {
            return json({ error: "Journal entry not found" }, { status: 404 });
        }

        // Return the journal entry details
        return json({ success: true, entry: journalEntry }, { status: 200 });
    } catch (error) {
        console.error("Error fetching journal entry:", error);
        return json({ error: "Failed to fetch journal entry" }, { status: 500 });
    }
}