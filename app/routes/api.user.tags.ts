import { json } from "@remix-run/node";
import { requireUserSession } from "~/utils/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);

    const journals = await prisma.journal.findMany({
        where: { userId },
        select: { tags: true }
    });

    const tags = Array.from(
        new Set(
            journals
                .filter(j => j.tags)
                .flatMap(j => JSON.parse(JSON.stringify(j.tags)))
        )
    );

    return json({ tags });
}