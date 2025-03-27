import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    // Require user session and get the authenticated user ID
    const userId = await requireUserSession(request);

    // Fetch all journals belonging to the user, selecting only the 'tags' field
    const journals = await prisma.journal.findMany({
        where: { userId },
        select: { tags: true }
    });

    // Extract unique tags from all journals
    const tags = Array.from(
        new Set(
            journals
                .filter(j => j.tags) // Filter journals that have tags
                .flatMap(j => JSON.parse(JSON.stringify(j.tags))) // Flatten and parse tags
        )
    );

    // Return the unique tags as JSON response
    return json({ tags });
}
