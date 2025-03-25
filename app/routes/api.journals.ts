import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);
    const url = new URL(request.url);

    // Get query parameters
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("categoryId");
    const mood = url.searchParams.get("mood");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const tag = url.searchParams.get("tag");

    // Build the where clause
    const where: any = { userId };

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { content: { contains: search } }
        ];
    }

    if (categoryId) {
        where.categoryId = parseInt(categoryId);
    }

    if (mood) {
        where.mood = mood;
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    if (tag) {
        where.tags = {
            path: '$[*]',
            array_contains: tag
        };
    }

    const journals = await prisma.journal.findMany({
        where,
        include: {
            category: true
        },
        orderBy: {
            date: "desc"
        }
    });

    // Get all filter options for UI
    const categories = await prisma.journalCategory.findMany();
    const moods = await prisma.journal.findMany({
        where: { userId },
        distinct: ["mood"],
        select: { mood: true }
    });

    return json({
        journals: journals.map(j => ({
            ...j,
            tags: j.tags ? JSON.parse(JSON.stringify(j.tags)) : []
        })),
        filters: {
            categories,
            moods: moods.filter(m => m.mood).map(m => m.mood)
        }
    });
}