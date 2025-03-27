import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request, params }) {
    // Get the authenticated user ID
    const userId = await requireUserSession(request);

    // Parse the journal ID from request parameters
    const journalId = parseInt(params.journalId);

    // Validate journal ID
    if (isNaN(journalId)) {
        return json({ error: "Invalid journal ID" }, { status: 400 });
    }

    try {
        // Verify if the journal exists and belongs to the user
        const journal = await prisma.journal.findUnique({
            where: { id: journalId },
            select: { userId: true },
        });

        // If the journal does not exist, return a 404 error
        if (!journal) {
            return json({ error: "Journal not found" }, { status: 404 });
        }

        // Check if the user is authorized to delete the journal
        if (journal.userId !== userId) {
            return json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete the journal
        await prisma.journal.delete({
            where: { id: journalId },
        });

        // Redirect to the journals list after deletion
        return redirect("/journals");
    } catch (error) {
        console.error("Failed to delete journal:", error);
        return json({ error: "Failed to delete journal" }, { status: 500 });
    }
}
