// app/routes/journals.$journalId.delete.ts
import { json, redirect } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request, params }) {
    const userId = await requireUserSession(request);
    const journalId = parseInt(params.journalId);

    if (isNaN(journalId)) {
        return json({ error: "Invalid journal ID" }, { status: 400 });
    }

    try {
        // Verify journal exists and belongs to user
        const journal = await prisma.journal.findUnique({
            where: { id: journalId },
            select: { userId: true }
        });

        if (!journal) {
            return json({ error: "Journal not found" }, { status: 404 });
        }

        if (journal.userId !== userId) {
            return json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete the journal
        await prisma.journal.delete({
            where: { id: journalId }
        });

        return redirect("/journals");
    } catch (error) {
        console.error("Failed to delete journal:", error);
        return json({ error: "Failed to delete journal" }, { status: 500 });
    }
}