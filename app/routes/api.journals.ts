import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    // Ensure the user is authenticated
    const userId = await requireUserSession(request);
    const url = new URL(request.url);

    // Extract query parameters from the request
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("categoryId");
    const mood = url.searchParams.get("mood");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const tag = url.searchParams.get("tag");

    // Build the 'where' clause for filtering
    const where = { userId };

    // Search by title or content
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { content: { contains: search } }
        ];
    }

    // Filter by category ID
    if (categoryId) {
        where.categoryId = parseInt(categoryId);
    }

    // Filter by mood
    if (mood) {
        where.mood = mood;
    }

    // Filter by date range
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    // Filter by tag (assuming tags are stored in an array-like structure)
    if (tag) {
        where.tags = {
            path: '$[*]',
            array_contains: tag
        };
    }

    // Fetch journals based on filters
    const journals = await prisma.journal.findMany({
        where,
        include: {
            category: true
        },
        orderBy: {
            date: "desc"
        }
    });

    // Fetch all available categories for filtering options
    const categories = await prisma.journalCategory.findMany();

    // Fetch all distinct moods for filtering options
    const moods = await prisma.journal.findMany({
        where: { userId },
        distinct: ["mood"],
        select: { mood: true }
    });

    return json({
        journals: journals.map(j => ({
            ...j,
            tags: j.tags ? JSON.parse(JSON.stringify(j.tags)) : [] // Ensure tags are parsed correctly
        })),
        filters: {
            categories,
            moods: moods.filter(m => m.mood).map(m => m.mood) // Filter out null moods
        }
    });
}
